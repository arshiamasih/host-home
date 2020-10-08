import * as React from 'react'
import {
    Host,
    MatchingQuestion,
    QualifyingQuestion,
    Question,
    ResponseOption,
} from '../models/v2'
import { HostResponse } from '../models/HostResponse'
import { ApiWrapper } from './ApiWrapper'
import { number } from 'yup'

const HostDashboardContext = React.createContext({})
const apiClient = new ApiWrapper()

interface HostDashboardData {
    qualifyingQuestionMapByOrder: Map<number, Array<number>>
    matchingQuestionMapByOrder: Map<number, Array<number>>
    showstopperQuestions: Array<QualifyingQuestion>
    matchingQuestions: Array<MatchingQuestion>
    hostResponse: HostResponse | null
    loaderState: {
        loading: boolean
        message: string
    }
    host?: Host
}

enum HostDashboardActionType {
    BeginFetchQuestions,
    FinishFetchQuestions,
    GetHostById,
    isLoading,
    BeginPostResponse,
    FinishPostResponse,
    Error,
}

interface HostDashboardAction {
    type: HostDashboardActionType
    payload?:
        | HostDashboardData
        | Array<QualifyingQuestion>
        | Array<MatchingQuestion>
        | string
        | HostResponse
        | any // how to resolve this any type on get questions payload?
    payload2?: any
}

const initialState: HostDashboardData = {
    qualifyingQuestionMapByOrder: new Map<number, Array<number>>(),
    matchingQuestionMapByOrder: new Map<number, Array<number>>(),
    showstopperQuestions: [],
    matchingQuestions: [],
    hostResponse: null,
    loaderState: {
        loading: false,
        message: '',
    },
}

function hostDashboardReducer(
    state: HostDashboardData,
    action: HostDashboardAction
): HostDashboardData {
    switch (action.type) {
        case HostDashboardActionType.BeginFetchQuestions: {
            return {
                ...state,
                loaderState: {
                    loading: true,
                    message: action.payload as string,
                },
            }
        }
        case HostDashboardActionType.FinishFetchQuestions: {
            return {
                ...state,
                loaderState: {
                    ...state.loaderState,
                    loading: false,
                },
                showstopperQuestions: action.payload[0] as Array<
                    QualifyingQuestion
                >,
                matchingQuestions: action.payload[1] as Array<MatchingQuestion>,
                qualifyingQuestionMapByOrder: action.payload2
                    .qualifyingQuestionMap as Map<number, Array<number>>,
                matchingQuestionMapByOrder: action.payload2
                    .matchingQuestionMap as Map<number, Array<number>>,
            }
        }
        case HostDashboardActionType.BeginPostResponse: {
            return {
                ...state,
                loaderState: {
                    loading: true,
                    message: action.payload as string,
                },
            }
        }
        case HostDashboardActionType.FinishPostResponse: {
            return {
                ...state,
                loaderState: {
                    ...state.loaderState,
                    loading: false,
                },
            }
        }

        default:
            throw new Error(`Unsupported action: ${JSON.stringify(action)}`)
    }
}

export function HostDashboardDataProvider(
    props: React.PropsWithChildren<{}>
): JSX.Element {
    const [state, dispatch] = React.useReducer(
        hostDashboardReducer,
        initialState
    )

    React.useEffect(() => {
        ;(async function () {
            console.log('loadData: fetching...')
            try {
                dispatch({
                    type: HostDashboardActionType.BeginFetchQuestions,
                    payload: 'Retrieving host questions...',
                })

                const hostQuestions = await Promise.all([
                    apiClient.getHostShowstopperQuestions(),
                    apiClient.getHostMatchingQuestions(),
                ])

                //set on state
                const qualifyingQuestions = hostQuestions[0]
                const matchingQuestions = hostQuestions[1]

                // re-uses logic in Question Pages to store corresponding indexes on component state
                function setQuestionsMap(questions: Array<QualifyingQuestion>) {
                    const groupsMap = new Map()
                    let groupI = 0
                    let subgroupI = 0

                    for (let i = 0; i < questions.length; i++) {
                        if (/[A-Za-z]/.test(questions[i].order)) continue

                        if (questions[i - 1]) {
                            if (
                                questions[i].group === undefined ||
                                questions[i].group !== questions[i - 1].group
                            ) {
                                groupI++
                                subgroupI = 0
                            } else if (
                                questions[i].subgroup === undefined ||
                                questions[i].subgroup !==
                                    questions[i - 1].subgroup
                            ) {
                                subgroupI++
                            }
                        }

                        groupsMap.set(questions[i].order, [groupI, subgroupI])
                        return groupsMap
                    }
                }

                const qualifyingQuestionsMap = setQuestionsMap(
                    qualifyingQuestions
                )
                const matchingQuestionsMap = setQuestionsMap(matchingQuestions)

                dispatch({
                    type: HostDashboardActionType.FinishFetchQuestions,
                    payload: hostQuestions,
                    payload2: { qualifyingQuestionsMap, matchingQuestionsMap },
                })
            } catch (e) {
                dispatch({
                    type: HostDashboardActionType.Error,
                    payload: `System error: ${e}`,
                })
            }
        })()
    }, [])

    const value = React.useMemo(() => [state, dispatch], [state])
    console.log(
        `HostDashboardDataProvider: Setting context value as: ${JSON.stringify(
            value
        )}`
    )
    return <HostDashboardContext.Provider value={value} {...props} />
}

export function useHostDashboardData() {
    const context = React.useContext(HostDashboardContext)
    console.log('this is context in a custom hook', context)
    if (!context) {
        throw new Error(
            'useHostDashboardData must be used within a HostDashboardProvider'
        )
    }

    // showstopper & matching
    const putShowstopperResponse = async (
        id: number | string,
        hostResponse: HostResponse
    ) => {
        console.log(`postHostResponse: ${hostResponse} `)
        try {
            dispatch({
                type: HostDashboardActionType.BeginPostResponse,
                payload: 'Posting host qualifying response...',
            })

            await apiClient.putShowstopperQuestionResponse(id, hostResponse)

            dispatch({
                type: HostDashboardActionType.FinishPostResponse,
                payload: 'Finished host qualifying response...',
            })
        } catch (e) {
            dispatch({
                type: HostDashboardActionType.Error,
                payload: `System error: ${e}`,
            })
        }
    }

    const putMatchingResponse = async (
        id: number | string,
        hostResponse: HostResponse
    ) => {
        console.log(`postHostResponse: ${hostResponse} `)
        try {
            dispatch({
                type: HostDashboardActionType.BeginPostResponse,
                payload: 'Posting host matching response...',
            })

            await apiClient.putMatchingQuestionResponse(id, hostResponse)

            dispatch({
                type: HostDashboardActionType.FinishPostResponse,
                payload: 'Finished host matching response...',
            })
        } catch (e) {
            dispatch({
                type: HostDashboardActionType.Error,
                payload: `System error: ${e}`,
            })
        }
    }

    // form detail
    const putPersonalInfo = async (hostResponse: object) => {
        console.log(`postHostResponse: ${hostResponse} `)
        try {
            dispatch({
                type: HostDashboardActionType.BeginPostResponse,
                payload: 'Posting host info details...',
            })

            await apiClient.putHostInformation(hostResponse)

            dispatch({
                type: HostDashboardActionType.FinishPostResponse,
                payload: 'Finished host response...',
            })
        } catch (e) {
            dispatch({
                type: HostDashboardActionType.Error,
                payload: `System error: ${e}`,
            })
        }
    }

    const putContactInfo = async (hostResponse: object) => {
        console.log(`postHostResponse: ${hostResponse} `)
        try {
            dispatch({
                type: HostDashboardActionType.BeginPostResponse,
                payload: 'Posting host info details...',
            })

            await apiClient.putHostContact(hostResponse)

            dispatch({
                type: HostDashboardActionType.FinishPostResponse,
                payload: 'Finished host response...',
            })
        } catch (e) {
            dispatch({
                type: HostDashboardActionType.Error,
                payload: `System error: ${e}`,
            })
        }
    }

    const putAddressInfo = async (hostResponse: object) => {
        console.log(`postHostResponse: ${hostResponse} `)
        try {
            dispatch({
                type: HostDashboardActionType.BeginPostResponse,
                payload: 'Posting host info details...',
            })

            await apiClient.putHostAddress(hostResponse)

            dispatch({
                type: HostDashboardActionType.FinishPostResponse,
                payload: 'Finished host response...',
            })
        } catch (e) {
            dispatch({
                type: HostDashboardActionType.Error,
                payload: `System error: ${e}`,
            })
        }
    }

    const putGenderInfo = async (hostResponse: object) => {
        console.log(`postHostResponse: ${hostResponse} `)
        try {
            dispatch({
                type: HostDashboardActionType.BeginPostResponse,
                payload: 'Posting host info details...',
            })

            await apiClient.putHostGender(hostResponse)

            dispatch({
                type: HostDashboardActionType.FinishPostResponse,
                payload: 'Finished host response...',
            })
        } catch (e) {
            dispatch({
                type: HostDashboardActionType.Error,
                payload: `System error: ${e}`,
            })
        }
    }

    const putLanguageInfo = async (hostResponse: object) => {
        console.log(`postHostResponse: ${hostResponse} `)
        try {
            dispatch({
                type: HostDashboardActionType.BeginPostResponse,
                payload: 'Posting host info details...',
            })

            await apiClient.putHostLanguage(hostResponse)

            dispatch({
                type: HostDashboardActionType.FinishPostResponse,
                payload: 'Finished host response...',
            })
        } catch (e) {
            dispatch({
                type: HostDashboardActionType.Error,
                payload: `System error: ${e}`,
            })
        }
    }

    const refreshQuestions = async () => {
        try {
            dispatch({
                type: HostDashboardActionType.BeginFetchQuestions,
                payload: 'Retrieving host questions...',
            })

            const hostQuestions = await Promise.all([
                apiClient.getHostShowstopperQuestions(),
                apiClient.getHostMatchingQuestions(),
            ])

            //set on state
            // const showstopperQuestionsMap = new Map<
            //     string,
            //     MatchingQuestionType
            // >()
            // hostQuestions[0].map((question: MatchingQuestionType) => {
            //     return showstopperQuestionsMap.set(question.id, question)
            // })

            // const matchingQuestionsMap = new Map<
            //     string,
            //     ShowstopperQuestionType
            // >()
            // hostQuestions[1].map((question: ShowstopperQuestionType) => {
            //     return matchingQuestionsMap.set(question.id, question)
            // })

            dispatch({
                type: HostDashboardActionType.FinishFetchQuestions,
                payload: hostQuestions,
            })
        } catch (e) {
            dispatch({
                type: HostDashboardActionType.Error,
                payload: `System error: ${e}`,
            })
        }
    }

    const addHostResponseOption = async (
        questionId: string,
        responseOption: ResponseOption
    ) => {
        try {
            dispatch({
                type: HostDashboardActionType.BeginFetchQuestions,
                payload: 'Adding response option...',
            })
            await apiClient.addResponseOption(
                'host',
                questionId,
                responseOption
            )
            await refreshQuestions()
        } catch (e) {
            dispatch({
                type: HostDashboardActionType.Error,
                payload: `System error: ${e}`,
            })
        }
    }

    //returns indexes as pair and Top Level Question to determine question type
    //refactor to make one Map
    const getQuestionByOrderId = (order: number) => {
        return initialState.qualifyingQuestionMapByOrder.get(order)
    }

    const getQualifyingQuestionByOrderId = (order: number) => {
        //dispatch
        return initialState.qualifyingQuestionMapByOrder.get(order)
    }

    const getMatchingQuestionByOrderId = (order: number) => {
        //dispatch
        return initialState.matchingQuestionMapByOrder.get(order)
    }
    console.log(`about to destructure context`)
    const [data, dispatch] = context as [
        HostDashboardData,
        React.Dispatch<HostDashboardAction>
    ]
    console.log(`about to destructure context`)

    const deleteMatchingQuestion = async (questionId: string) => {
        try {
            dispatch({
                type: HostDashboardActionType.BeginFetchQuestions,
                payload: 'Deleting question',
            })
            await apiClient.deleteQuestion('host', 'Matching', questionId)
            await refreshQuestions()
        } catch (e) {
            dispatch({
                type: HostDashboardActionType.Error,
                payload: `System error: ${e}`,
            })
        }
    }

    const updateMatchingQuestion = async (question: MatchingQuestion) => {
        try {
            dispatch({
                type: HostDashboardActionType.BeginFetchQuestions,
                payload: 'Updating question',
            })
            await apiClient.updateQuestion('host', 'Matching', question)
            await refreshQuestions()
        } catch (e) {
            dispatch({
                type: HostDashboardActionType.Error,
                payload: `System error: ${e}`,
            })
        }
    }

    const updateHostResponseOption = async (
        questionId: string,
        responseOption: ResponseOption
    ) => {
        try {
            dispatch({
                type: HostDashboardActionType.BeginFetchQuestions,
                payload: 'Updating question',
            })
            await apiClient.updateResponseOption(
                'host',
                questionId,
                responseOption
            )
            await refreshQuestions()
        } catch (e) {
            dispatch({
                type: HostDashboardActionType.Error,
                payload: `System error: ${e}`,
            })
        }
    }

    return {
        data,
        dispatch,
        getQuestionByOrderId,
        getQualifyingQuestionByOrderId,
        getMatchingQuestionByOrderId,
        putShowstopperResponse,
        putMatchingResponse,
        putPersonalInfo,
        putContactInfo,
        putAddressInfo,
        putGenderInfo,
        putLanguageInfo,
        addHostResponseOption,
        updateHostResponseOption,
        deleteMatchingQuestion,
        updateMatchingQuestion,
    }
}

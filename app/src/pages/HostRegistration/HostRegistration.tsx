import * as React from 'react'
import { useAuth0, Auth0User } from '../../react-auth0-spa'
import {
    HostDashboardDataProvider,
    useHostDashboardData,
} from '../../data/host-context'
import {
    Switch,
    Route,
    useRouteMatch,
    useParams,
    useHistory,
} from 'react-router'
import MatchingQuestionPage from '../../components/ProfileEdit/MatchingQuestionPage'
import ShowstopperQuestionPage from '../../components/ProfileEdit/ShowstopperQuestionPage'
import { render } from '@testing-library/react'

const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    console.log(e.target)
}

export const HostRegistration = () => {
    const { user } = useAuth0()
    return (
        <HostDashboardDataProvider>
            <HostQuestionsPage />
        </HostDashboardDataProvider>
    )
}

export const DefaultRegComp = () => {
    return <div>Host Registration Default Component</div>
}

export const ProgressBarTemp = () => {
    return <></>
}
export interface QuestionPanelProps {
    onResponseChanged: (response: string) => void
}
export const QuestionPanel = (props: QuestionPanelProps) => {
    return <></>
}
export interface ControlPanelProps {}
export const ControlPanel = (props: ControlPanelProps) => {
    return <></>
}

export const QuestionPageTemp = () => {
    let { questionType, orderId } = useParams()
    const history = useHistory()
    let { path } = useRouteMatch()

    const {
        getQuestionByOrderId,
        getQualifyingQuestionByOrderId,
        getMatchingQuestionByOrderId,
        data,
        putMatchingResponse,
    } = useHostDashboardData()

    // next question params
    // should these from context --> return an object with variables as keys
    let currentQuestion = getQuestionByOrderId(orderId)
    let nextQuestion = getQuestionByOrderId(orderId++)
        ? getQuestionByOrderId(orderId++)
        : null

    let nextQuestionType = nextQuestion ? nextQuestion.type : null
    let nextQuestionOrderId = +orderId++

    const routeNextQuestion = () => {
        nextQuestion
            ? history.push(`${path}/${nextQuestionType}/${nextQuestionOrderId}`)
            : history.push(`/host/dashboard`)
    }

    const changeResponse = () => {}

    const renderQuestionPage = (
        registrationQuestionType: string
    ): JSX.Element => {
        switch (registrationQuestionType) {
            case 'Qualifying':
                return (
                    <ShowstopperQuestionPage
                        showstopperQuestions={data.showstopperQuestions}
                        question={currentQuestion}
                        routeNextQuestion={routeNextQuestion}
                    />
                )
            case 'Matching':
                return (
                    <MatchingQuestionPage
                        matchingQuestions={data.matchingQuestions}
                        question={currentQuestion}
                        routeNextQuestion={routeNextQuestion}
                    />
                )

            case 'info':
            //switch case for info type
            default:
                return <DefaultRegComp />
        }
    }
    return (
        <>
            <ProgressBarTemp />
            {/* <QuestionPanel onResponseChanged={changeResponse} /> */}
            {renderQuestionPage(questionType)}

            <ControlPanel />
        </>
    )
}

export const HostQuestionsPage = () => {
    let { path } = useRouteMatch()

    return (
        <Switch>
            <Route
                path={`${path}/:questionType/:orderId`}
                component={QuestionPageTemp}
            />
            {/* <Route
                path={`${path}/qualifying/:questionId`}
                render={() => {
                    return (
                        <QuestionPage
                            stepwise={true}
                            onSubmit={handleSubmit}
                            showstopperQuestions={getShowstopperQuestions()}
                            matchingQuestions={getMatchingQuestions()}
                        />
                        // <ShowstopperQuestionPage
                        //     stepwise={true}
                        //     onSubmit={handleSubmit}
                        //     showstopperQuestions={getShowstopperQuestions()}
                        //     matchingQuestions={getMatchingQuestions()}
                        // />
                    )
                }}
            />

            <Route
                path={`${path}/bio/info`}
                render={() => {
                    return (
                        <QuestionPage
                            stepwise={true}
                            onSubmit={handleSubmit}
                            showstopperQuestions={getShowstopperQuestions()}
                            matchingQuestions={getMatchingQuestions()}
                        />
                    )
                }}
            />

            <Route
                path={`${path}/bio/address`}
                render={() => {
                    return (
                        <QuestionPage
                            stepwise={true}
                            onSubmit={handleSubmit}
                            showstopperQuestions={getShowstopperQuestions()}
                            matchingQuestions={getMatchingQuestions()}
                        />
                    )
                }}
            />

            <Route
                path={`${path}/bio/language`}
                render={() => {
                    return (
                        <QuestionPage
                            stepwise={true}
                            onSubmit={handleSubmit}
                            showstopperQuestions={getShowstopperQuestions()}
                            matchingQuestions={getMatchingQuestions()}
                        />
                    )
                }}
            />

            <Route
                path={`${path}/bio/gender`}
                render={() => {
                    return (
                        <QuestionPage
                            stepwise={true}
                            onSubmit={handleSubmit}
                            showstopperQuestions={getShowstopperQuestions()}
                            matchingQuestions={getMatchingQuestions()}
                        />
                    )
                }}
            />

            <Route
                path={`${path}/contact`}
                render={() => {
                    return (
                        <QuestionPage
                            stepwise={true}
                            onSubmit={handleSubmit}
                            showstopperQuestions={getShowstopperQuestions()}
                            matchingQuestions={getMatchingQuestions()}
                        />
                    )
                }}
            />

            <Route
                path={`${path}/matching/:questionId`}
                render={() => {
                    return (
                        <QuestionPage
                            stepwise={true}
                            onSubmit={handleSubmit}
                            matchingQuestions={getMatchingQuestions()}
                        />
                        // <MatchingQuestionPage
                        //     stepwise={true}
                        //     onSubmit={handleSubmit}
                        //     showstopperQuestions={getShowstopperQuestions()}
                        //     matchingQuestions={getMatchingQuestions()}
                        // />
                    )
                }}
            /> */}

            <Route exact path={`${path}`} component={DefaultRegComp} />
        </Switch>
    )
}

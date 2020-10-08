// export type QuestionType =
//     | 'Qualifying'
//     | 'Info'
//     | 'Matching'
//     | 'Bio'
//     | 'Personal'
//     | 'info'

export type QuestionType = 'Qualifying' | 'info' | 'Matching'

export interface GenericQuestion {
    _id: string
    id: string
    group: QuestionType
    subgroup?: string
    question: string
    order: string
    type: string
}

export interface QualifyingQuestion extends GenericQuestion {
    options: Array<ResponseOption>
}

export interface ResponseOption {
    text: string
    id: string
    value: string
    label: string
}

export interface MatchingQuestion extends GenericQuestion {
    subgroup: string
    options: Array<ResponseOption>
}

export interface InfoQuestion extends GenericQuestion {
    options: Array<ResponseOption>
}

export type Question = InfoQuestion | MatchingQuestion | QualifyingQuestion

export interface GenericQuestionResponseSet {
    [index: string]: string | number | Array<string>
}

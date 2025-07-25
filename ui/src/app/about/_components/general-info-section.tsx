import QuestionItem from '@/app/about/_components/question-item';

const GeneralInfoSection = () => {
    const generalInfoItems = [
        {
            question: 'How do I request a new grouping?',
            answer: (
                <a
                    className="text-link-color hover:underline hover:text-link-hover-color"
                    href="https://uhawaii.atlassian.net/wiki/spaces/UHIAM/pages/13402308/UH+Groupings+Request+Form"
                    aria-label="A request form is available"
                >
                    A request form is available.
                </a>
            )
        },
        {
            question: 'What is the Include members list?',
            answer:
                'A grouping\'s Include is the portion of the grouping membership that is manually updated. ' +
                'It may be empty.'
        },
        {
            question: 'Exactly what is a grouping?',
            answer: (
                <>
                    <a
                        className="text-link-color hover:underline hover:text-link-hover-color"
                        href="https://uhawaii.atlassian.net/wiki/spaces/UHIAM/pages/13403213/UH+Groupings"
                        aria-label="General information about groupings is available"
                    >
                        General information about groupings is available.
                    </a>{' '}
                    A grouping&apos;s components include the Basis, Include, and Exclude lists.
                </>
            )
        },
        {
            question: 'What is the Exclude members list?',
            answer:
                'A grouping\'s Exclude overrides automatic and manual membership by' +
                ' explicitly not including anyone listed here. It may be empty.'
        },
        {
            question: 'What is the Basis?',
            answer:
                'A grouping\'s Basis is the portion of the grouping membership that is automatically updated.' +
                ' It may be empty.'
        }
    ];

    return (
        <div className="container pt-10 pb-10">
            <h2 className="info-title">GENERAL INFORMATION</h2>
            <QuestionItem data={generalInfoItems} col={2} />
        </div>
    );
};

export default GeneralInfoSection;

"""
Static fallback quiz containing 10 engaging, scenario-driven career questions.
Used as a resilient fail-safe when Gemini API is down, rate-limited, or unavailable.
Conforms strictly to valid_quiz requirements:
- Exactly 10 questions
- Exactly 4 options per question
- Trait codes in {A, C, S, L, B, O}
- Each trait code appears at least 5 times across all 40 options.
"""

FALLBACK_QUIZ = {
    "questions": [
        {
            "q": "When starting an ambitious new initiative or challenge, what is your initial instinct?",
            "options": [
                {"text": "Analyze data, metrics, and system constraints carefully.", "trait": "A"},
                {"text": "Brainstorm creative concepts, novel perspectives, and UX possibilities.", "trait": "C"},
                {"text": "Understand stakeholder expectations and team member perspectives.", "trait": "S"},
                {"text": "Define project scope, high-impact milestones, and execution timelines.", "trait": "L"}
            ]
        },
        {
            "q": "When encountering a sudden system or operational bottleneck, you instinctively:",
            "options": [
                {"text": "Dissect the root cause through systematic debugging and logic.", "trait": "A"},
                {"text": "Build a quick technical or physical prototype to test a fix.", "trait": "B"},
                {"text": "Organize an orderly action plan to resolve issues step-by-step.", "trait": "O"},
                {"text": "Take initiative, rally the team, and make the tough strategic calls.", "trait": "L"}
            ]
        },
        {
            "q": "Which activity would you most enjoy during an innovation workshop?",
            "options": [
                {"text": "Drafting conceptual user experiences, visuals, and storyboards.", "trait": "C"},
                {"text": "Hands-on assembly, configuring hardware, and testing tools.", "trait": "B"},
                {"text": "Mentoring peers and facilitating collaborative group discussions.", "trait": "S"},
                {"text": "Structuring documentation, workflows, and quality standards.", "trait": "O"}
            ]
        },
        {
            "q": "When choosing an elective course or learning track, you naturally gravitate toward:",
            "options": [
                {"text": "Advanced algorithms, mathematical modeling, and empirical research.", "trait": "A"},
                {"text": "Design thinking, creative arts, and expressive media.", "trait": "C"},
                {"text": "Practical engineering workshops and laboratory experiments.", "trait": "B"},
                {"text": "Human behavior, psychology, and public communications.", "trait": "S"}
            ]
        },
        {
            "q": "In a team hackathon or competition, your natural contribution is:",
            "options": [
                {"text": "Leading the pitch, delegating responsibilities, and guiding vision.", "trait": "L"},
                {"text": "Writing core logic, data scripts, and running analytical tests.", "trait": "A"},
                {"text": "Ensuring precision, scheduling check-ins, and bug tracking.", "trait": "O"},
                {"text": "Rapidly hacking together functional modules and tooling.", "trait": "B"}
            ]
        },
        {
            "q": "When evaluating the success of a completed project, what matters most to you?",
            "options": [
                {"text": "The tangible positive impact and value delivered to real people.", "trait": "S"},
                {"text": "The originality and elegant ingenuity of the final solution.", "trait": "C"},
                {"text": "The flawless reliability, stability, and operational precision.", "trait": "O"},
                {"text": "Achieving measurable targets and competitive leadership recognition.", "trait": "L"}
            ]
        },
        {
            "q": "If you have a free weekend to dive into a personal passion project, you would:",
            "options": [
                {"text": "Tinker with electronics, craft physical models, or repair machinery.", "trait": "B"},
                {"text": "Research a fascinating academic theory, historical puzzle, or dataset.", "trait": "A"},
                {"text": "Create digital artwork, compose music, or write a creative story.", "trait": "C"},
                {"text": "Organize a community workshop or mentor younger students.", "trait": "S"}
            ]
        },
        {
            "q": "How do you prefer to handle high-stakes deadlines and competing priorities?",
            "options": [
                {"text": "Build comprehensive checklists, calendar blocks, and strict timelines.", "trait": "O"},
                {"text": "Make assertive priority calls and streamline the roadmap.", "trait": "L"},
                {"text": "Focus on the highest-leverage technical bottlenecks and solve them.", "trait": "A"},
                {"text": "Experiment with unconventional shortcuts and lateral solutions.", "trait": "C"}
            ]
        },
        {
            "q": "When collaborating with a diverse group on a contentious decision, you tend to:",
            "options": [
                {"text": "Listen actively, build consensus, and ensure everyone feels heard.", "trait": "S"},
                {"text": "Build a quick working demo to let real evidence settle the debate.", "trait": "B"},
                {"text": "Chart decision matrices with quantifiable weighted criteria.", "trait": "A"},
                {"text": "Step up, summarize consensus, and drive decisive closure.", "trait": "L"}
            ]
        },
        {
            "q": "What kind of work environment brings out your highest performance?",
            "options": [
                {"text": "A well-structured organization with crystal-clear protocols and standards.", "trait": "O"},
                {"text": "A creative studio where visual, verbal, and conceptual innovation is celebrated.", "trait": "C"},
                {"text": "An engineering lab or workshop with cutting-edge tools and materials.", "trait": "B"},
                {"text": "A mission-driven organization dedicated to education, health, or social good.", "trait": "S"}
            ]
        }
    ]
}


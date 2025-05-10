const ExamCard = ({ exam }) => {
    return (
        <div className="bg-dark-200 rounded-lg p-6 border border-dark-300 hover:border-accent-100 transition-all duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-medium text-light-100">{exam.title}</h3>
                    <p className="text-light-400 mt-1">{exam.subject}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    exam.status === 'active' ? 'bg-green-900 text-green-300' : 
                    exam.status === 'upcoming' ? 'bg-accent-400 text-accent-100' : 
                    'bg-dark-400 text-light-300'
                }`}>
                    {exam.status}
                </span>
            </div>
            
            <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-light-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-light-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{exam.duration} minutes</span>
                </div>
                <div className="flex items-center text-sm text-light-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-light-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{exam.date}</span>
                </div>
                <div className="flex items-center text-sm text-light-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-light-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>{exam.questions} questions</span>
                </div>
            </div>
            
            <div className="mt-6">
                <button className="w-full bg-accent-100 hover:bg-accent-200 text-light-100 py-2 px-4 rounded-md transition-colors duration-200 font-medium">
                    {exam.status === 'active' ? 'Start Exam' : 'View Details'}
                </button>
            </div>
        </div>
    );
};

export default ExamCard;

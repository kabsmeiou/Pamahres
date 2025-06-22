import { ChatHistoryList } from "./ChatHistoryList";
import { useQuery } from '@tanstack/react-query';
import { useChatbot } from '../../services/chatbot';
import { useParams } from 'react-router-dom';
import { ChatHistoryProps } from '../../types/course';
import { MessageCircle, AlertCircle, Clock } from 'react-feather';
import Loading from '../../components/Loading';

const ChatHistoryIndex = () => {
    const { getHistory } = useChatbot();
    const { courseId } = useParams<{ courseId: string }>();
    const numericCourseId = parseInt(courseId ?? '', 10);

    // history is an array of objects with previous_messages and name_filter
    const { data: history, isLoading, error } = useQuery<ChatHistoryProps[]>({
        queryKey: ['chatHistory', numericCourseId],
        queryFn: () => getHistory(numericCourseId) as Promise<ChatHistoryProps[]>,
        enabled: !!numericCourseId,
    });

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="mb-8 flex items-center gap-3">
                    <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                        <MessageCircle size={24} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-surface-800 dark:text-surface-100">Chat History</h1>
                        <p className="text-surface-500 dark:text-surface-400 text-sm">
                            Review your past conversations with course materials
                        </p>
                    </div>
                </div>
                <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm p-8">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
                            <Clock size={24} className="text-primary-500 dark:text-primary-400 animate-pulse" />
                        </div>
                        <p className="text-surface-600 dark:text-surface-400">Loading chat history...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8">
                <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm p-8 w-full max-w-lg">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle size={24} className="text-red-500 dark:text-red-400" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2 text-surface-800 dark:text-surface-100">Oh no!</h1>
                        <p className="text-red-600 dark:text-red-400 mb-2">Failed to load chat history.</p>
                        <p className="text-surface-500 dark:text-surface-400">Please try refreshing the page or contact support if the problem persists.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-8 flex items-center gap-3">
                <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                    <MessageCircle size={24} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-surface-800 dark:text-surface-100">Chat History</h1>
                    <p className="text-surface-500 dark:text-surface-400 text-sm">
                        Review your past conversations with course materials
                    </p>
                </div>
            </div>
            
            {history && history.length > 0 ? (
                <ChatHistoryList histories={history} />
            ) : (
                <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm p-8">
                    <div className="flex flex-col items-center text-center max-w-md mx-auto">
                        <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
                            <MessageCircle size={24} className="text-primary-500 dark:text-primary-400" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2 text-surface-800 dark:text-surface-100">No chat history yet</h2>
                        <p className="text-surface-500 dark:text-surface-400">
                            Start a conversation with your course materials to see your chat history here.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatHistoryIndex;
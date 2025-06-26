import { Loader, Trash2, AlertTriangle, X } from 'react-feather';

interface ActionConfirmationProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
    headerMessage: string;
    bodyMessage: string;
    itemName?: string;
    itemType?: 'Material' | 'Quiz' | 'Course' | 'Profile';
    action?: 'delete' | 'submit' | 'other';
    confirmButtonText?: string;
    confirmButtonColor?: 'red' | 'primary';
}
// improve ux by handling deletion on backend and instantly removing the frontend item(card) after confirmation.
// instead of loading in the popup delete confirmation, have a loading component on the top right that shows the user a toast that the item is being deleted.
const ActionConfirmation = ({
    show,
    onClose,
    onConfirm,
    isLoading = false,
    headerMessage,
    bodyMessage,
    itemName,
    itemType,
    action = 'other',
    confirmButtonText,
    confirmButtonColor = 'primary'
}: ActionConfirmationProps) => {
    if (!show) return null;

    const getIcon = () => {
        if (action === 'delete') return <Trash2 className="text-red-500" size={24} />;
        return <AlertTriangle className="text-yellow-500" size={24} />;
    };

    const getConfirmButtonStyle = () => {
        if (confirmButtonColor === 'red') {
            return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
        }
        return 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500';
    };

    return (
        <div 
            className="fixed inset-0 bg-black/40 dark:bg-gray-900/80 flex items-center justify-center z-50 px-4 transition-opacity duration-200 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-lg animate-fadeIn transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-4">
                        {getIcon()}
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {headerMessage}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 transition-colors dark:text-gray-300 dark:hover:text-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-400">
                        {bodyMessage}
                        {itemName && itemType && (
                            <span className="font-medium text-gray-900 dark:text-gray-100 block mt-2">
                                {itemType}: {itemName}
                            </span>
                        )}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-gray-300 transition-colors"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors flex items-center gap-2 ${getConfirmButtonStyle()} ${
                            isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {isLoading ? (
                            <>
                                <Loader size={16} className="animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <span>{confirmButtonText || (action === 'delete' ? 'Delete' : 'Confirm')}</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActionConfirmation;
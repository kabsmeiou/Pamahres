import { useEffect, useState } from 'react';
import { Save, Bell, User, Shield, Database } from 'react-feather';
import Error from '../components/Error';
import { UserDetail } from '../types/user';
import { useQuery } from '@tanstack/react-query';
import { useUserApi } from '../services/users';
import ActionConfirmation from '../components/ActionConfirmation';
import { useQueryClient } from '@tanstack/react-query';

interface Settings {
  notifications: boolean;
  darkMode: boolean;
  autoSave: boolean;
}

const Settings = () => {
  // Place this at the top of your component, after other hooks:
  const queryClient = useQueryClient();

  function invalidateQueries({ queryKey }: { queryKey: string[] }) {
    queryClient.invalidateQueries({ queryKey });
  }
  
  const { getUserDetails, updateUserProfile } = useUserApi();

  const { data: UserInfo, isLoading } = useQuery<UserDetail>({
    queryKey: ['profile'],
    queryFn: () => getUserDetails() as Promise<UserDetail>,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [madeChanges, setMadeChanges] = useState(false);
  const [formData, setFormData] = useState({
    first_name: UserInfo?.first_name || '',
    last_name: UserInfo?.last_name || '',
    email: UserInfo?.email || '',
    user_course: UserInfo?.profile.user_course || '',
    // age should be a number, but we will store it as a string for input purposes
    age: UserInfo?.profile.age?.toString() || ''
  });

  useEffect(() => {
    if (UserInfo) {
      setFormData({
        first_name: UserInfo.first_name || '',
        last_name: UserInfo.last_name || '',
        email: UserInfo.email || '',
        user_course: UserInfo.profile.user_course || '',
        age: UserInfo.profile.age?.toString() || ''
      });
    }
  }, [UserInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement settings update logic
    // before submitting, ensure age is a number
    const response = await updateUserProfile(
      {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        user_course: formData.user_course, // Map to backend field name
        age: formData.age ? parseInt(formData.age, 10) : null, // convert to number or null
        mbti_type: UserInfo?.profile.mbti_type || '',
        target_study_hours: UserInfo?.profile.target_study_hours || null,
        current_grade: UserInfo?.profile.current_grade || null
      }
    );
    console.log(response);
    invalidateQueries({ queryKey: ['profile'] });
    setMadeChanges(false);
    setIsEditing(false);
  };

  const handleEdit = () => {
    if (isEditing) {
      if (madeChanges) {
        // ask user if they want to discard changes
        setShowActionConfirmation(true);
        return;
      }
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }

  const [showActionConfirmation, setShowActionConfirmation] = useState(false);

  const confirmCancel = () => {
    setIsEditing(false);
    setMadeChanges(false);
    setShowActionConfirmation(false);
    // Reset form data to original values
    if (UserInfo) {
      setFormData({
        first_name: UserInfo.first_name || '',
        last_name: UserInfo.last_name || '',
        email: UserInfo.email || '',
        user_course: UserInfo.profile.user_course || '',
        age: UserInfo.profile.age?.toString() || ''
      });
    }
  };
  console.log("UserInfo", UserInfo);
  const handleFieldChange = (field: string, value: string) => {
    setMadeChanges(true);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <ActionConfirmation
        show={showActionConfirmation}
        onClose={() => setShowActionConfirmation(false)}
        onConfirm={confirmCancel}
        headerMessage="Discard Changes?"
        bodyMessage="If you cancel now, your changes will not be saved."
      />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Account Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your profile and account preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-surface-800 rounded-xl shadow-sm border border-gray-100 dark:border-surface-700 overflow-hidden sticky top-24">
            <div className="px-5 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">Menu</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-surface-700">
              <button className="w-full px-5 py-3.5 flex items-center gap-3 text-primary-600 dark:text-primary-400 bg-primary-50/70 dark:bg-primary-900/30 border-l-3 border-primary-500 dark:border-primary-400 font-medium">
                <User size={18} strokeWidth={2.5} />
                <span>My Profile</span>
              </button>
              <button className="w-full px-5 py-3.5 flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-700 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <Bell size={18} strokeWidth={2} />
                <span>Notifications</span>
              </button>
              <button className="w-full px-5 py-3.5 flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-700 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <Shield size={18} strokeWidth={2} />
                <span>Security</span>
              </button>
              <button className="w-full px-5 py-3.5 flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-700 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <Database size={18} strokeWidth={2} />
                <span>Data Export</span>
              </button>
            </div>
            <div className="px-5 py-4 mt-4 border-t border-gray-100 dark:border-surface-700">
              <button className="w-full py-2.5 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 text-sm font-medium transition-colors flex items-center justify-center">
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="md:col-span-3 space-y-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-surface-800 rounded-xl shadow-sm border border-gray-100 dark:border-surface-700 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 dark:bg-surface-700 border-b border-gray-100 dark:border-surface-600 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">My Profile</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEditing ? 'Make changes to your personal information' : 'Manage your personal information'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isEditing && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md text-xs font-medium">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    Editing
                  </div>
                )}
                <button 
                  className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 text-sm shadow-sm transition-all duration-200 ${
                    isEditing 
                      ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50' 
                      : 'bg-white dark:bg-surface-600 border-gray-200 dark:border-surface-500 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-700'
                  }`}
                  onClick={handleEdit}
                >
                  {isEditing ? (
                    <>
                      Cancel
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </>
                  ) : (
                    <>
                      Edit 
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start md:items-center space-x-6 pb-6 mb-6 border-b border-gray-100 dark:border-surface-700">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-800/40 dark:to-primary-900/60 flex items-center justify-center text-primary-600 dark:text-primary-400 border-4 border-white dark:border-surface-800 shadow-sm overflow-hidden">
                    {isLoading ? (
                      <div className="animate-pulse w-full h-full bg-primary-100 dark:bg-primary-900/30"></div>
                    ) : UserInfo?.first_name ? (
                      <span className="text-3xl font-bold">{UserInfo.first_name[0]}{UserInfo.last_name ? UserInfo.last_name[0] : ''}</span>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    )}
                  </div>
                  <button className="absolute -bottom-1 -right-1 bg-primary-500 dark:bg-primary-600 text-white p-1.5 rounded-full shadow-sm hover:bg-primary-600 dark:hover:bg-primary-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                  </button>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    {isLoading ? (
                      <div className="animate-pulse h-7 bg-gray-200 dark:bg-surface-700 rounded w-40"></div>
                    ) : (
                      <>{UserInfo?.first_name || ''} {UserInfo?.last_name || ''}</>
                    )}
                  </h3>
                  <div className="text-gray-500 dark:text-gray-400 text-sm">
                    {isLoading ? (
                      <div className="animate-pulse h-5 bg-gray-200 dark:bg-surface-700 rounded w-60 mt-1"></div>
                    ) : (
                      <>{UserInfo?.profile.user_course || 'No course selected'}</>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">Personal Information</h3>
                
                { isLoading ? (
                  <div className="animate-pulse space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="h-12 bg-gray-200 dark:bg-surface-700 rounded"></div>
                      <div className="h-12 bg-gray-200 dark:bg-surface-700 rounded"></div>
                    </div>
                    <div className="h-12 bg-gray-200 dark:bg-surface-700 rounded"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="h-12 bg-gray-200 dark:bg-surface-700 rounded"></div>
                      <div className="h-12 bg-gray-200 dark:bg-surface-700 rounded"></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          First Name
                        </label>
                        <input
                          type="text"
                          id="first_name"
                          value={isEditing ? formData.first_name : (UserInfo?.first_name || '')}
                          disabled={!isEditing}
                          onChange={(e) => handleFieldChange('first_name', e.target.value)}
                          className={`w-full px-3.5 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:border-primary-500 dark:focus:border-primary-400 shadow-sm transition-all ${
                            isEditing 
                              ? 'border-gray-200 dark:border-surface-600 dark:bg-surface-700 dark:text-surface-100' 
                              : 'border-gray-100 dark:border-surface-800 bg-gray-50 dark:bg-surface-900 text-gray-500 dark:text-surface-400 cursor-not-allowed'
                          }`}
                          placeholder="Enter your first name"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="last_name"
                          value={isEditing ? formData.last_name : (UserInfo?.last_name || '')}
                          disabled={!isEditing}
                          onChange={(e) => handleFieldChange('last_name', e.target.value)}
                          className={`w-full px-3.5 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:border-primary-500 dark:focus:border-primary-400 shadow-sm transition-all ${
                            isEditing 
                              ? 'border-gray-200 dark:border-surface-600 dark:bg-surface-700 dark:text-surface-100' 
                              : 'border-gray-100 dark:border-surface-800 bg-gray-50 dark:bg-surface-900 text-gray-500 dark:text-surface-400 cursor-not-allowed'
                          }`}
                          placeholder="Enter your last name"
                          required
                        /> 
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={isEditing ? formData.email : (UserInfo?.email || '')}
                        disabled={!isEditing}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        className={`w-full px-3.5 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:border-primary-500 dark:focus:border-primary-400 shadow-sm transition-all ${
                          isEditing 
                            ? 'border-gray-200 dark:border-surface-600 dark:bg-surface-700 dark:text-surface-100' 
                            : 'border-gray-100 dark:border-surface-800 bg-gray-50 dark:bg-surface-900 text-gray-500 dark:text-surface-400 cursor-not-allowed'
                        }`}
                        placeholder="you@example.com"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="course" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Course/Program
                        </label>
                        <input
                          type="text"
                          id="course"
                          value={isEditing ? formData.user_course : (UserInfo?.profile.user_course || '')}
                          disabled={!isEditing}
                          onChange={(e) => handleFieldChange('user_course', e.target.value)}
                          className={`w-full px-3.5 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:border-primary-500 dark:focus:border-primary-400 shadow-sm transition-all ${
                            isEditing 
                              ? 'border-gray-200 dark:border-surface-600 dark:bg-surface-700 dark:text-surface-100' 
                              : 'border-gray-100 dark:border-surface-800 bg-gray-50 dark:bg-surface-900 text-gray-500 dark:text-surface-400 cursor-not-allowed'
                          }`}
                          placeholder="Computer Science, Biology, etc."
                        />
                      </div>
                      <div>
                        <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Age
                        </label>
                        <input
                          type="number"
                          id="age"
                          value={isEditing ? formData.age : (UserInfo?.profile.age || '')}
                          disabled={!isEditing}
                          onChange={(e) => handleFieldChange('age', e.target.value)}
                          className={`w-full px-3.5 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500/50 dark:focus:ring-primary-400/50 focus:border-primary-500 dark:focus:border-primary-400 shadow-sm transition-all ${
                            isEditing 
                              ? 'border-gray-200 dark:border-surface-600 dark:bg-surface-700 dark:text-surface-100' 
                              : 'border-gray-100 dark:border-surface-800 bg-gray-50 dark:bg-surface-900 text-gray-500 dark:text-surface-400 cursor-not-allowed'
                          }`}
                          placeholder="18"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end pt-5 border-t border-gray-100 dark:border-surface-700 mt-8">
                  <button
                    type="submit"
                    disabled={!isEditing || !madeChanges}
                    className={`px-6 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium shadow-sm ${
                      (!isEditing || !madeChanges)
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-60'
                        : 'bg-primary-600 dark:bg-primary-700 text-white hover:bg-primary-700 dark:hover:bg-primary-800 hover:shadow-md'
                    }`}
                  >
                    <Save size={18} />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;


"use client"

import { useState, useEffect } from "react"
import { Outlet, Link } from "react-router-dom"
import Sidebar from "./Sidebar"
import { ThemeToggle } from "./ThemeToggle"
import { Menu, User, Calendar } from "react-feather"
import { UserDetail } from '../types/user';
import { useQuery } from '@tanstack/react-query';
import { useUserApi } from '../services/users';
import { createContext } from "react"
import { Course as CourseType } from "../types/course";
import { useCoursesApi } from "../services/courses";
import Toast from "../components/Toast";

type LayoutContext = {  
  courses: CourseType[] | null;
  isFetchingCourses?: boolean;
  setShowToast?: (show: boolean) => void;
};

export const LayoutContext = createContext<LayoutContext | null>(null); 

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const { getUserDetails } = useUserApi();

  const { data: userInfo, isLoading: userLoading } = useQuery<UserDetail>({
    queryKey: ['profile'],
    queryFn: () => getUserDetails() as Promise<UserDetail>,
  });
  
  const { getCourses } = useCoursesApi();
  
  const { data: courses, isLoading: isFetchingCourses } = useQuery<CourseType[]>({
    queryKey: ['courses'],
    queryFn: () => getCourses(),
    enabled: true, // Fetch courses on initial load
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setCollapsed(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const [showToast, setShowToast] = useState(false);

  function onCloseToast() {
    console.log("Toast closed");
    setShowToast(false);
  }

  return (
    <div className="flex h-screen bg-surface-50 dark:bg-surface-900">
      {/* Mobile Sidebar Overlay */}
      {isMobile && showMobileSidebar && (
        <div
          className="fixed inset-0 bg-surface-900/50 dark:bg-surface-950/70 z-40 animate-fadeIn"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        ${isMobile ? "fixed z-50" : "relative"}
        ${isMobile && !showMobileSidebar ? "-translate-x-full" : "translate-x-0"}
        transition-transform duration-300 ease-in-out
      `}
      >
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          isMobile={isMobile}
          onClose={() => setShowMobileSidebar(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-surface-800 border-b border-surface-100/60 dark:border-surface-700/40 flex justify-center items-center px-4 sticky top-0 shadow-sm transition-colors z-10">
          <div className="flex items-center justify-between md:justify-end gap-4 w-full max-w-screen-2xl mx-auto">
            {isMobile && (
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg mr-2 text-surface-600 hover:text-surface-900 dark:text-surface-300 dark:hover:text-surface-100 transition-colors"
              >
                <Menu size={22} />
              </button>
            )}

            {/* Search Bar - Uncomment and update when needed
            <div className="flex-1 max-w-2xl hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search courses"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border-surface-200 dark:border-surface-600 bg-surface-50 dark:bg-surface-700 text-surface-900 dark:text-surface-100 placeholder-surface-500 dark:placeholder-surface-400 focus:bg-white dark:focus:bg-surface-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
                <Search className="absolute left-3 top-2.5 text-surface-400 dark:text-surface-500" size={20} />
              </div>
            </div> */}

            <div className="flex items-center gap-2">
              {/* Current Date in Month, Day, Year */}
              <div className="flex items-center text-surface-600 dark:text-surface-300 bg-surface-50 dark:bg-surface-700/30 px-3 py-1.5 rounded-lg">
                <span className="text-sm font-medium text-surface-500 dark:text-surface-400">
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <Calendar className="inline-block ml-1.5 text-primary-500 dark:text-primary-400" size={16} />
              </div>


              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Profile */}
              <Link
                to="/settings"
                className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-all hover:shadow-sm group border border-transparent hover:border-surface-100 dark:hover:border-surface-700"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 text-primary-600 dark:text-primary-300 flex items-center justify-center shadow-sm group-hover:shadow">
                  <User size={18} />
                </div>
                {userLoading ? (
                  <span className="text-sm font-medium text-surface-500 dark:text-surface-400 animate-pulse">Loading...</span>
                ) : (
                  <span className="text-sm font-medium text-surface-800 dark:text-surface-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {userInfo?.first_name.split(" ")[0] || "User"}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </header>
        {/* Main Content Area */}
        <LayoutContext.Provider value={{ courses: courses ?? null, isFetchingCourses, setShowToast }}>
          <main className="flex-1 overflow-auto bg-surface-50 dark:bg-surface-900 transition-colors">
            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-screen-2xl">
                { showToast && (
                  <Toast 
                    message="This feature is currently unavailable. Please try again later." 
                    type="error"
                    title="Error"
                    onClose={onCloseToast}
                  />
                )}
              <div className="relative z-10">
                <Outlet />
              </div>
            </div>
          </main>
        </LayoutContext.Provider>
      </div>
    </div>
  )
}

export default Layout;
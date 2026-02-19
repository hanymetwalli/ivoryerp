/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Attendance from './pages/Attendance';
import AuditLog from './pages/AuditLog';
import Bonuses from './pages/Bonuses';
import CheckInOut from './pages/CheckInOut';
import Contracts from './pages/Contracts';
import Dashboard from './pages/Dashboard';
import DevelopmentLog from './pages/DevelopmentLog';
import DiagnosticsPermissions from './pages/DiagnosticsPermissions';
import Employees from './pages/Employees';
import EvaluationForm from './pages/EvaluationForm';
import EvaluationTemplates from './pages/EvaluationTemplates';
import JobDescriptions from './pages/JobDescriptions';
import Leaves from './pages/Leaves';
import OrganizationalStructure from './pages/OrganizationalStructure';
import Overtime from './pages/Overtime';
import Payroll from './pages/Payroll';
import PerformanceEvaluations from './pages/PerformanceEvaluations';
import Reports from './pages/Reports';
import Resignations from './pages/Resignations';
import RolesPermissions from './pages/RolesPermissions';
import SecurityCheck from './pages/SecurityCheck';
import Settings from './pages/Settings';
import TemplateBuilder from './pages/TemplateBuilder';
import Trainings from './pages/Trainings';
import UserManagement from './pages/UserManagement';
import WorkLocations from './pages/WorkLocations';
import Login from './pages/Login';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Attendance": Attendance,
    "AuditLog": AuditLog,
    "Bonuses": Bonuses,
    "CheckInOut": CheckInOut,
    "Contracts": Contracts,
    "Dashboard": Dashboard,
    "DevelopmentLog": DevelopmentLog,
    "DiagnosticsPermissions": DiagnosticsPermissions,
    "Employees": Employees,
    "EvaluationForm": EvaluationForm,
    "EvaluationTemplates": EvaluationTemplates,
    "JobDescriptions": JobDescriptions,
    "Leaves": Leaves,
    "OrganizationalStructure": OrganizationalStructure,
    "Overtime": Overtime,
    "Payroll": Payroll,
    "PerformanceEvaluations": PerformanceEvaluations,
    "Reports": Reports,
    "Resignations": Resignations,
    "RolesPermissions": RolesPermissions,
    "SecurityCheck": SecurityCheck,
    "Settings": Settings,
    "TemplateBuilder": TemplateBuilder,
    "Trainings": Trainings,
    "UserManagement": UserManagement,
    "WorkLocations": WorkLocations,
    "Login": Login,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};
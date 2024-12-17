import './App.css';
import Sidebar from './utils/sidebar-utils/Sidebar';
import MainContent from './components/MainContent';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PrivateRoute from "./utils/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import Base from "./components/u-base/Base";
import JobList from './components/jobs/JobList';
import JobDetail from './components/jobs/JobDetail';
import Login from './components/u-login/Login';
import Applicants from './components/applicants/Applicants';
import Reports from './components/reports/Reports';
import Documents from './components/documents/Documents';
import CreateJob from './components/jobs/CreateJob';
import CandidateForm from './components/candidate-form/CandidateFom';
import RegisterUser from './components/register/RegisterUser';
import ApplicantProfile from './components/applicants/ApplicantProfile';
import JobOverview from './components/jobs/JobOverview';
import JobApplicants from './components/jobs/JobApplicants';
import JobFilterGroups from './components/jobs/JobFilterGroups';
import Profile from './components/profile/Profile';
import Profile2 from './components/profile/Profile2';
import Interviews from './components/interviews/Interviews';
import CreateInterviewFlow from './components/interviews/CreateInterviewFlow';
import { AvatarProvider } from './context/AvatarContext';
import VideoComponent from "./components/personality-screening/VideoComponent";
import JobInterviews from './components/jobs/JobInterviews';
import ApplicantResumeCopy from './components/applicants/ApplicantResumeCopy';
import ApplicantOverview from './components/applicants/ApplicantOverview';
import ApplicantPersonalityScreening from './components/applicants/ApplicantPersonalityScreening';
import Tour from './components/personality-screening/Tour';
import ScreeningTour from './components/personality-screening/ScreeningTour';
import PageNotFound from './utils/static templates/PageNotFound';
import InterviewWorkflow from './components/interviews/InterviewWorkflow';
import Tests from './components/tests/Tests';
import TestBuilder from './components/tests/TestBuilder';
import WebcamRec from './components/personality-screening/react-webcam/WebcamRec';
import ProfileComments from './components/applicants/ProfileComments';
import Questionnaire from './components/candidate-form/Questionnaire';
import VideoRecorder from './components/personality-screening/react-webcam/VideoRecorder';
import List from './components/personality-screening/admin/List';
import JobQuestions from './components/jobs/JobQuestions';
import JobPreferences from './components/jobs/JobPreferences';
import ResumeList from './components/resumes-screenings/ResumeList';
import TestInstructions from './components/candidate-interface/TestInstructions';
import Test from './components/candidate-interface/Test';
import Completed from './components/candidate-interface/Completed';
import TestLogCompleted from './components/candidate-interface/TestLogCompleted';
import ApplicantTracking from './components/applicants/ApplicantTracking';
import TestViewer from './components/tests/TestViewer';
import ResetPasswordEmail from './components/register/ResetPasswordEmail'
import ResetPassword from './components/register/ResetPassword'
import AssignedAssessments from './components/tests/AssignedAssessments';
import PersonalInfo from './components/profile/PersonalInfo';
import Users from './components/profile/Users';
import Notifications from './components/profile/Notifications';
import Credits from './components/profile/Credits';
// // import AdminOnboarding from './components/register/AdminOnbording';
import { ToastContainer } from 'react-toastify';
import DemoList from './components/superuser-components/DemoList';
import ApplicantResume from './components/applicants/ApplicantResume';
import Organization from './components/register/Organization';
import Admin from './components/register/Admin';


function App() {
  return (
    <div className="flex font-sans app-main">
      <ToastContainer/>
      <BrowserRouter>
        {/* Public Routes */}
        {/* Test  */}
        <Routes>
          <Route path="/app/page-not-found/" element={<PageNotFound />} />
          <Route path="/app/candidate/:jobkey/" element={<CandidateForm />} />
          {/* <Route path="/app/candidate/:jobkey/questionnaire/" element={<Questionnaire />} /> */}
          <Route path="/app/candidate/personality-screening/:candidateId/:screeningId/" element={<Tour />} />
          <Route path="/app/candidate/personality-screening/:candidateId/:screeningId/tour/" element={<ScreeningTour />} />
          <Route path="/app/candidate/personality-screening/:candidateId/:screeningId/start/" element={<VideoComponent />} />
          <Route path="/app/candidate/:candidateId/test/:testlogId/:uniqueId/" element={<TestInstructions />} />
          <Route path="/app/candidate/:candidateId/test/:testlogId/:uniqueId/start/:assessmentType/:testId" element={<Test />} />
          <Route path="/app/candidate/:candidateId/test/:testlogId/:uniqueId/completed/:statusCode" element={<TestLogCompleted />} />
          <Route path="/app/candidate/:candidateId/test/:testlogId/:uniqueId/completed/:assessmentType/:testId" element={<Completed />} />
        </Routes>

        {/* Protected Routes */}
        <AuthProvider>
          <AvatarProvider>
            <Routes>
              <Route path="/app/register/" element={<RegisterUser />} />
              <Route path="/app/login/" element={<Login />} />
              <Route path="/admin/login/" element={<Login />} state={{ role: 'admin' }} />
              <Route path="/app/send-reset-password-email/" element={<ResetPasswordEmail />} />
              {/* <Route path="/app/admin-reset-password/" element={<AdminOnboarding />} /> */}
              <Route path="/app/organization/signup" element={<Organization />} />
              <Route path="/app/organization/admin" element={<Admin />} />
              <Route path="/app/reset-password/:uid/:token" element={<ResetPassword />} />
              <Route path="/app/" element={<PrivateRoute />}>
                <Route path="/app/" element={<Base />}>
                  <Route path="/app/admin/demos/" element={<DemoList />} />

                  <Route path="/app/user/profile/" element={<Profile2 />}>
                    {/* Default route when no sub-route is specified */}
                    <Route index element={<PersonalInfo />} />
                    <Route path="personal-info" element={<PersonalInfo />} />
                    <Route path="/app/user/profile/users/" element={<Users />} />
                    <Route path="/app/user/profile/notifications/" element={<Notifications />} />
                    <Route path="/app/user/profile/credits/" element={<Credits />} />
                  </Route>
                  <Route path="/app/user/jobs/" element={<JobList />} />
                  <Route path="/app/user/jobs/job/:jobId/" element={<JobDetail />}>
                    <Route path="/app/user/jobs/job/:jobId/overview/" element={<JobOverview />} />
                    <Route path="/app/user/jobs/job/:jobId/applicants/" element={<JobApplicants />} />
                    <Route path="/app/user/jobs/job/:jobId/filter-groups/" element={<JobFilterGroups />} />
                    <Route path="/app/user/jobs/job/:jobId/questions/" element={<JobQuestions />} />
                    <Route path="/app/user/jobs/job/:jobId/preferences/" element={<JobPreferences />} />
                    <Route path="/app/user/jobs/job/:jobId/interviews/" element={<JobInterviews />} />
                  </Route>
                  <Route path="/app/user/interviews/" element={<Interviews />} />
                  <Route path="/app/user/personality-screening/:serviceId/" element={<List />} />
                  <Route path="/app/user/resume-screening/:serviceId/" element={<ResumeList />} />
                  <Route path="/app/user/test/:serviceId/" element={<Tests />} />
                  <Route path="/app/user/assigned-assessments/:serviceId/" element={<AssignedAssessments />} />
                  <Route path="/app/user/coming-soon/" element={<Documents />} />
                  <Route path="/app/user/jobs/create-job/" element={<CreateJob />} />
                  <Route path="/app/user/jobs/edit-job/:jobId/:stepId/" element={<CreateJob />} />
                  <Route path="/app/user/applicants/" element={<Applicants />} />
                  <Route path="/app/user/applicants/applicant/:applicantId/profile/" element={<ApplicantProfile />}>
                    <Route path="/app/user/applicants/applicant/:applicantId/profile/overview/" element={<ApplicantOverview />} />
                    <Route path="/app/user/applicants/applicant/:applicantId/profile/resume-screening/:serviceId/" element={<ApplicantResumeCopy />} />
                    <Route path="/app/user/applicants/applicant/:applicantId/profile/automated-video-interview/:serviceId/" element={<ApplicantPersonalityScreening />} />
                    <Route path="/app/user/applicants/applicant/:applicantId/profile/assessment/:serviceId/" element={<ApplicantTracking />} />
                    <Route path="/app/user/applicants/applicant/:applicantId/profile/comments/" element={<ProfileComments />} />
                  </Route>
                </Route>
                <Route path="/app/user/tests/:assessmentType/:testId/" element={<TestBuilder />} />
                <Route path="/app/user/tests/:assessmentType/:testId/view/" element={<TestViewer />} />
                <Route path="/app/user/interviews/create-interview-flow/" element={<InterviewWorkflow />} />
                <Route path="/app/user/interviews/edit-interview-flow/:interviewId/" element={<InterviewWorkflow />} />
              </Route>
            </Routes>
          </AvatarProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
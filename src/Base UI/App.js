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
import Interviews from './components/interviews/Interviews';
import CreateInterviewFlow from './components/interviews/CreateInterviewFlow';
import { AvatarProvider } from './context/AvatarContext';
import VideoComponent from "./components/personality-screening/VideoComponent";
import JobInterviews from './components/jobs/JobInterviews';

function App() {
 //console.count("---------------App-------------------")
  return (
    <div className="flex font-sans app-main">
      <BrowserRouter>
        <Routes>
          <Route path="/candidate/:jobkey" element={<CandidateForm />} />
          <Route path="/candidate/personality-screening/:candidateId/:screeningId/" element={<VideoComponent />} />
        </Routes>
        <AuthProvider>
          <AvatarProvider>
          <Routes>
            <Route path="/register/" element={<RegisterUser />} />
            <Route path="/login/" element={<Login />} />
            <Route path="/" element={<PrivateRoute />}>
              <Route path="/" element={<Base />} >
                <Route path="/app/user/profile/" element={<Profile />} />
                <Route path="/app/user/jobs/" element={<JobList />} />
                <Route path="/app/user/jobs/job/:jobId/" element={<JobDetail />} >
                  <Route path="/app/user/jobs/job/:jobId/overview/" element={<JobOverview />} />
                  <Route path="/app/user/jobs/job/:jobId/applicants/" element={<JobApplicants />} />
                  <Route path="/app/user/jobs/job/:jobId/filter-groups/" element={<JobFilterGroups />} />
                  <Route path="/app/user/jobs/job/:jobId/interviews/" element={<JobInterviews />} />
                </Route>
                <Route path="/app/user/interviews/" element={<Interviews />} />
                <Route path="/app/user/interviews/create-interview-flow/" element={<CreateInterviewFlow />} />
                <Route path="/app/user/interviews/edit-interview-flow/:interviewId/" element={<CreateInterviewFlow />} />
                <Route path="/app/user/jobs/create-job/" element={<CreateJob />} />
                <Route path="/app/user/jobs/edit-job/:jobId/" element={<CreateJob />} />
                <Route path="/app/user/applicants/" element={<Applicants />} />
                <Route path="/app/user/applicants/applicant/:applicantId/" element={<ApplicantProfile />}>
                  <Route path="/app/user/applicants/applicant/:applicantId/profile/" element={<ApplicantProfile />} />
                  <Route path="/app/user/applicants/applicant/:applicantId/score/" element={<ApplicantProfile />} />
                </Route>

                <Route path="/app/user/reports/" element={<Reports />} />
                <Route path="/app/user/documents/" element={<Documents />} />
              </Route>

            </Route>

          </Routes>
          </AvatarProvider>
        </AuthProvider>
      </BrowserRouter>

    </div>

  );
}

export default App;

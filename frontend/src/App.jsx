import { BrowserRouter, Routes, Route } from "react-router-dom";
import SubjectPage from "./pages/SubjectPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import FolderView from "./pages/FolderView";
import Announcements from "./pages/Announcements";
import CreateAnnouncement from "./pages/CreateAnnouncement";
import CreateSubject from "./pages/CreateSubject";
import CreateFolder from "./pages/CreateFolder";
import UploadFile from "./pages/UploadFile";
import Users from "./pages/Users";
import CreateAssignment from "./pages/CreateAssignment";
import Signup from "./pages/Signup";
import Timetable from "./pages/Timetable";
import Assignments from "./pages/Assignments"




function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/subjects"
          element={<Subjects />}
        />

        <Route
          path="/folder/:id"
          element={<FolderView />}
        />

        <Route
          path="/announcements"
          element={<Announcements />}
        />

        <Route
          path="/subject/:id"
          element={<SubjectPage />}
        />

        <Route
          path="/create-announcement"
          element={<CreateAnnouncement />}
        />

        <Route
          path="/create-subject"
          element={<CreateSubject />}
        />

        <Route
          path="/create-folder"
          element={<CreateFolder />}
        />

        <Route
          path="/upload-file"
          element={<UploadFile />}
        />

        <Route
          path="/users"
          element={<Users />}
        />

        <Route
          path="/create-assignment"
          element={<CreateAssignment />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/timetable"
          element={<Timetable />}
        />

        <Route
          path="/Assignments"
          element={<Assignments />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
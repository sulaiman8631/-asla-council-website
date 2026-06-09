import { Route, Routes } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/admin/ProtectedRoute";

import Home from "./pages/Home";
import About from "./pages/About";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Tenders from "./pages/Tenders";
import TenderDetail from "./pages/TenderDetail";
import Reports from "./pages/Reports";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import NewsList from "./pages/admin/NewsList";
import NewsForm from "./pages/admin/NewsForm";
import JobsList from "./pages/admin/JobsList";
import JobForm from "./pages/admin/JobForm";
import TendersList from "./pages/admin/TendersList";
import TenderForm from "./pages/admin/TenderForm";
import ReportsList from "./pages/admin/ReportsList";
import ReportForm from "./pages/admin/ReportForm";
import GalleryAdmin from "./pages/admin/GalleryAdmin";
import Messages from "./pages/admin/Messages";
import TownInfoEditor from "./pages/admin/TownInfoEditor";
import ContactInfoEditor from "./pages/admin/ContactInfoEditor";
import AccountSettings from "./pages/admin/AccountSettings";

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="news" element={<News />} />
        <Route path="news/:id" element={<NewsDetail />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="jobs/:id" element={<JobDetail />} />
        <Route path="tenders" element={<Tenders />} />
        <Route path="tenders/:id" element={<TenderDetail />} />
        <Route path="reports" element={<Reports />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/admin/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="news" element={<NewsList />} />
        <Route path="news/new" element={<NewsForm />} />
        <Route path="news/:id" element={<NewsForm />} />
        <Route path="jobs" element={<JobsList />} />
        <Route path="jobs/new" element={<JobForm />} />
        <Route path="jobs/:id" element={<JobForm />} />
        <Route path="tenders" element={<TendersList />} />
        <Route path="tenders/new" element={<TenderForm />} />
        <Route path="tenders/:id" element={<TenderForm />} />
        <Route path="reports" element={<ReportsList />} />
        <Route path="reports/new" element={<ReportForm />} />
        <Route path="reports/:id" element={<ReportForm />} />
        <Route path="gallery" element={<GalleryAdmin />} />
        <Route path="messages" element={<Messages />} />
        <Route path="town" element={<TownInfoEditor />} />
        <Route path="contact-info" element={<ContactInfoEditor />} />
        <Route path="account" element={<AccountSettings />} />
      </Route>
    </Routes>
  );
}

export default App;

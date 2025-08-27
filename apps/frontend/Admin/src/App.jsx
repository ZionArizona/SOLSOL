import { BrowserRouter, Routes, Route } from "react-router-dom"
import MainPage from "./pages/MainPage"
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import SubmissionManage from './pages/SubmissionManage'
import ScholarshipCreate from './pages/ScholarshipCreate'
import ScholarshipManage from './pages/ScholarshipManage'
import ScholarshipDetail from './pages/ScholarshipDetail'
import ScholarshipEdit from './pages/ScholarshipEdit'
import NoticeManage from './pages/NoticeManage'
import NoticeDetail from './pages/NoticeDetail'
import NoticeEdit from './pages/NoticeEdit'
import PublicNoticeList from './pages/publicNoticeList'
import MyPage from './pages/MyPage'

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage/>}/>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/signup" element={<SignupPage/>}/>
        <Route path="/admin/submissions" element={<SubmissionManage/>}/>
        <Route path="/admin/scholarships/regist" element={<ScholarshipCreate/>}/>
        <Route path="/admin/scholarships" element={<ScholarshipManage/>}/>
        <Route path="/admin/notices" element={<NoticeManage/>}/>
        <Route path="/admin/notices/:id" element={<NoticeDetail/>}/>
        <Route path="/admin/notices/:id/edit" element={<NoticeEdit/>}/>
        <Route path="/admin/scholarships/:id" element={<ScholarshipDetail/>}/>
        <Route path="/admin/scholarships/:id/edit" element={<ScholarshipEdit/>}/>
        <Route path="/notices" element={<PublicNoticeList/>}/>
        <Route path="/mypage" element={<MyPage/>}/>
      </Routes>
    </BrowserRouter>
  )
}

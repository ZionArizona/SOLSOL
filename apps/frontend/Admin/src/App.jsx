import { BrowserRouter, Routes, Route } from "react-router-dom"
import AdminRoute from "./components/AdminRoute"
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
        {/* 인증 불필요 페이지 */}
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/signup" element={<SignupPage/>}/>
        
        {/* 관리자 권한 필요 페이지 */}
        <Route path="/" element={<AdminRoute><MainPage/></AdminRoute>}/>
        <Route path="/admin/submissions" element={<AdminRoute><SubmissionManage/></AdminRoute>}/>
        <Route path="/admin/scholarships/regist" element={<AdminRoute><ScholarshipCreate/></AdminRoute>}/>
        <Route path="/admin/scholarships" element={<AdminRoute><ScholarshipManage/></AdminRoute>}/>
        <Route path="/admin/notices" element={<AdminRoute><NoticeManage/></AdminRoute>}/>
        <Route path="/admin/notices/:id" element={<AdminRoute><NoticeDetail/></AdminRoute>}/>
        <Route path="/admin/notices/:id/edit" element={<AdminRoute><NoticeEdit/></AdminRoute>}/>
        <Route path="/admin/scholarships/:id" element={<AdminRoute><ScholarshipDetail/></AdminRoute>}/>
        <Route path="/admin/scholarships/:id/edit" element={<AdminRoute><ScholarshipEdit/></AdminRoute>}/>
        <Route path="/notices" element={<AdminRoute><PublicNoticeList/></AdminRoute>}/>
        <Route path="/mypage" element={<AdminRoute><MyPage/></AdminRoute>}/>
      </Routes>
    </BrowserRouter>
  )
}

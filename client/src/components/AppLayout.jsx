import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { closeCreatePost } from '../features/ui/uiSlice';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import BottomNav from './BottomNav';
import CreatePost from './CreatePost';
import Modal from './Modal';
import './AppLayout.css';

// The frame around every logged-in page:
// desktop = sidebar | page | suggestions,   mobile = top bar + page + bottom tabs.
export default function AppLayout() {
  const dispatch = useDispatch();
  const createPostOpen = useSelector((state) => state.ui.createPostOpen);

  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">Skip to content</a>
      <Navbar />
      <Sidebar />
      <main id="main" className="app-main">
        <Outlet />
      </main>
      <RightSidebar />
      <BottomNav />

      <Modal open={createPostOpen} title="Create post" onClose={() => dispatch(closeCreatePost())}>
        <CreatePost onSuccess={() => dispatch(closeCreatePost())} />
      </Modal>
    </div>
  );
}

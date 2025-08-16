import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import './styles/sidebar.css';

// Lazy-load the Sidebar component to create a separate chunk and reduce initial bundle size.
const Sidebar = lazy(() => import('./components/Sidebar').then(mod => ({ default: mod.Sidebar })));

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
	<Suspense fallback={<div style={{padding:16}}>Loading...</div>}>
		<Sidebar />
	</Suspense>
);

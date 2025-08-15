// src/routes.jsx
import { Routes, Route } from "react-router-dom";

// Pages
import Home from "./pages/Home/Home";
import Auth from "./pages/Auth/Auth";
import Account from "./pages/Account/Account";

export default function AppRoutes({ session }) {
	return (
		<Routes>
			{session ? (
				<>
					<Route path="/" element={<Home />} />
					<Route path="/account" element={<Account />} />
				</>
			) : (
				<>
					<Route path="/*" element={<Auth />} />
				</>
			)}
		</Routes>
	);
}

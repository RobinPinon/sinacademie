import { Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import './Navbar.scss';

export default function Navbar() {

    const handleLogout = async () => {
		await supabase.auth.signOut();
	};
    
    return (
        <div className="navbar">
            <ul>
                <li>
                    <Link to={"/"}>
                        Home
                    </Link>
                </li>
                <li>
                    <Link to={"/bestiary/"}>
                        Bestiary
                    </Link>
                </li>
                <li>
                    <Link to={"/account/"}>
                        Profile
                    </Link>
                </li>
                <li>
                    <button className="logout" onClick={handleLogout}>
                        Se déconnecter
                    </button>
                </li>
            </ul>
        </div>
    )
}
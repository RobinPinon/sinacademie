import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import "./Home.scss";

export default function Home({ user }) {
	const [username, setUsername] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getProfile();
	}, []);

	async function getProfile() {
		try {
			setLoading(true);
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) return;

			// Charger username depuis la table profiles
			const { data, error } = await supabase
				.from("profiles")
				.select("username")
				.eq("id", user.id)
				.single();

			if (error) {
				console.error(error);
				return;
			}

			setUsername(data?.username || "");
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="home">
			{loading ? (
				<p>Chargement...</p>
			) : (
				<p>
					Salut <strong>{username || "Utilisateur"}</strong>
				</p>
			)}
		</div>
	);
}


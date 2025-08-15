import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import "./Account.scss";

export default function Account() {
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(false);
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [jsonData, setJsonData] = useState(null);
	const [lastJsonUpload, setLastJsonUpload] = useState(null);
	const [jsonFileName, setJsonFileName] = useState("");
	const [importing, setImporting] = useState(false);

	useEffect(() => {
		getProfile();
	}, []);

	async function getProfile() {
		try {
			setLoading(true);
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) throw new Error("Utilisateur non connecté");

			setEmail(user.email);

			// Charger username et données JSON depuis la table profiles
			const { data, error } = await supabase
				.from("profiles")
				.select("username, json_data, last_json_upload, json_file_name")
				.eq("id", user.id)
				.single();

			if (error) throw error;

			setUsername(data.username || "");
			setJsonData(data.json_data);
			setLastJsonUpload(data.last_json_upload);
			setJsonFileName(data.json_file_name || "");
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	}

	async function updateProfile(e) {
		e.preventDefault();
		try {
			setLoading(true);
			const {
				data: { user },
			} = await supabase.auth.getUser();

			const updates = {
				id: user.id,
				username,
				updated_at: new Date(),
			};

			const { error } = await supabase.from("profiles").upsert(updates);
			if (error) throw error;
			alert("Profil mis à jour !");
			setEditing(false);
		} catch (error) {
			alert(error.message);
		} finally {
			setLoading(false);
		}
	}

	const handleEdit = () => {
		setEditing(true);
	};

	const handleCancel = () => {
		setEditing(false);
		// Recharger les données originales
		getProfile();
	};

	const handleFileImport = async (event) => {
		const file = event.target.files[0];
		if (!file) return;

		try {
			setImporting(true);
			const fileContent = await file.text();
			const jsonContent = JSON.parse(fileContent);

			const {
				data: { user },
			} = await supabase.auth.getUser();

			const updates = {
				id: user.id,
				json_data: jsonContent,
				json_file_name: file.name,
				last_json_upload: new Date().toISOString(),
				updated_at: new Date(),
			};

			const { error } = await supabase.from("profiles").upsert(updates);
			if (error) throw error;

			// Mettre à jour l'état local
			setJsonData(jsonContent);
			setJsonFileName(file.name);
			setLastJsonUpload(updates.last_json_upload);
			
			alert("Fichier JSON importé avec succès !");
		} catch (error) {
			if (error.name === 'SyntaxError') {
				alert("Erreur : Le fichier n'est pas un JSON valide");
			} else {
				alert("Erreur lors de l'import : " + error.message);
			}
		} finally {
			setImporting(false);
		}
	};

	const formatDate = (dateString) => {
		if (!dateString) return "Aucun import";
		return new Date(dateString).toLocaleDateString('fr-FR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	return (
		<div className="account">
			<h1>Mon compte</h1>

			{loading ? (
				<p>Chargement...</p>
			) : (
				<div className="account__content">
					{!editing ? (
						<div className="account__info">
							<div className="account__field">
								<label>Email :</label>
								<p>{email}</p>
							</div>

							<div className="account__field">
								<label>Nom d'utilisateur :</label>
								<p>{username || "Non défini"}</p>
							</div>

							<button 
								className="account__edit-btn" 
								onClick={handleEdit}
								disabled={loading}
							>
								Éditer
							</button>
						</div>
					) : (
						<form onSubmit={updateProfile} className="account__form">
							<label>
								Email :
								<input type="email" value={email} disabled />
							</label>

							<label>
								Nom d'utilisateur :
								<input
									type="text"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
								/>
							</label>

							<div className="account__form-actions">
								<button type="submit" disabled={loading}>
									{loading ? "Enregistrement..." : "Enregistrer"}
								</button>
								<button 
									type="button" 
									onClick={handleCancel}
									disabled={loading}
									className="account__cancel-btn"
								>
									Annuler
								</button>
							</div>
						</form>
					)}

					<div className="account__json-section">
						<h2>Import de données JSON</h2>
						
						<div className="account__json-info">
							<div className="account__field">
								<label>Dernier import :</label>
								<p>{formatDate(lastJsonUpload)}</p>
							</div>

							{jsonFileName && (
								<div className="account__field">
									<label>Nom du fichier :</label>
									<p className="account__filename">{jsonFileName}</p>
								</div>
							)}
						</div>

						<div className="account__import-section">
							<input
								type="file"
								accept=".json"
								onChange={handleFileImport}
								id="json-file-input"
								className="account__file-input"
								disabled={importing}
							/>
							<label 
								htmlFor="json-file-input" 
								className={`account__import-btn ${importing ? 'importing' : ''}`}
							>
								{importing ? "Import en cours..." : "Importer un fichier JSON"}
							</label>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

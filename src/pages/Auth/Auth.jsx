import { useState } from "react";
import { supabase } from "../../supabaseClient";
import Button from "../../components/Button/Button";
import "./Auth.scss";

export default function Auth() {
	const [mode, setMode] = useState("login"); // 'login' | 'signup'
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const toggleMode = () => {
		setMode(mode === "login" ? "signup" : "login");
		setError("");
		setMessage("");
		setPassword("");
		setUsername("");
	};

	// Vérification de la force du mot de passe
	const passwordCriteria = {
		length: password.length >= 8,
		upper: /[A-Z]/.test(password),
		lower: /[a-z]/.test(password),
		number: /[0-9]/.test(password),
		special: /[^A-Za-z0-9]/.test(password),
	};

	const isPasswordStrong = Object.values(passwordCriteria).every(Boolean);

	// Fonction pour déterminer si l'identifiant est un email ou un nom d'utilisateur
	const isEmail = (identifier) => {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
	};

	// Fonction pour obtenir l'identifiant de connexion (email ou username)
	const getLoginIdentifier = () => {
		return mode === "login" ? (username || email) : email;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setMessage("");

		if (mode === "signup" && !isPasswordStrong) {
			setError(
				"Le mot de passe ne respecte pas les critères de sécurité."
			);
			return;
		}

		setLoading(true);

		try {
			if (mode === "signup") {
				const { data, error } = await supabase.auth.signUp({
					email,
					password,
				});
				if (error) throw error;

				// Si l'inscription réussit et qu'on a un username, créer le profil
				if (data.user && username) {
					const { error: profileError } = await supabase
						.from('profiles')
						.insert({
							id: data.user.id,
							email: email,
							username: username
						});

					if (profileError) {
						console.error('Erreur lors de la création du profil:', profileError);
					}
				}

				setMessage(
					"Inscription réussie. Vérifie tes e-mails pour confirmer."
				);
			} else {
				// Pour la connexion, on peut utiliser email ou username
				const identifier = getLoginIdentifier();
				
				if (!identifier) {
					setError("Veuillez saisir un email ou un nom d'utilisateur.");
					return;
				}

				// Si c'est un email, on se connecte directement
				if (isEmail(identifier)) {
					const { error } = await supabase.auth.signInWithPassword({
						email: identifier,
						password,
					});
					if (error) throw error;
				} else {
					// Si c'est un username, on récupère l'email associé depuis la table profiles
					try {
						const { data: profile, error: profileError } = await supabase
							.from('profiles')
							.select('email')
							.eq('username', identifier)
							.single();

						if (profileError || !profile) {
							setError("Nom d'utilisateur introuvable.");
							return;
						}

						// Connexion avec l'email récupéré
						const { error } = await supabase.auth.signInWithPassword({
							email: profile.email,
							password,
						});
						if (error) throw error;
					} catch (profileErr) {
						setError(profileErr.message || "Erreur lors de la connexion par nom d'utilisateur.");
						return;
					}
				}
			}
		} catch (err) {
			setError(err.message || "Une erreur est survenue.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="auth">
			<div className="auth__card">
				<h1>{mode === "login" ? "Connexion" : "Créer un compte"}</h1>

				<form onSubmit={handleSubmit} className="auth__form">
					{mode === "login" && (
						<label>
							<span>Email ou nom d'utilisateur</span>
							<input
								type="text"
								value={username || email}
								onChange={(e) => {
									const value = e.target.value;
									if (isEmail(value)) {
										setEmail(value);
										setUsername("");
									} else {
										setUsername(value);
										setEmail("");
									}
								}}
								required
								autoComplete="username"
								placeholder="Saisis ton email ou nom d'utilisateur"
							/>
						</label>
					)}

					{mode === "signup" && (
						<>
							<label>
								<span>Email</span>
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									autoComplete="email"
								/>
							</label>

							<label>
								<span>Nom d'utilisateur (optionnel)</span>
								<input
									type="text"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									autoComplete="username"
									placeholder="Choisis un nom d'utilisateur"
								/>
							</label>
						</>
					)}

					<label>
						<span>Mot de passe</span>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							autoComplete={
								mode === "login"
									? "current-password"
									: "new-password"
							}
						/>
					</label>

					{mode === "signup" && (
						<div className="password-hints">
							<p>Votre mot de passe doit contenir :</p>
							<ul>
								<li
									className={
										passwordCriteria.length ? "ok" : "bad"
									}
								>
									Au moins 8 caractères
								</li>
								<li
									className={
										passwordCriteria.upper ? "ok" : "bad"
									}
								>
									Une majuscule
								</li>
								<li
									className={
										passwordCriteria.lower ? "ok" : "bad"
									}
								>
									Une minuscule
								</li>
								<li
									className={
										passwordCriteria.number ? "ok" : "bad"
									}
								>
									Un chiffre
								</li>
								<li
									className={
										passwordCriteria.special ? "ok" : "bad"
									}
								>
									Un caractère spécial
								</li>
							</ul>
						</div>
					)}

					<Button type="submit" disabled={loading}>
						{loading
							? "Patiente..."
							: mode === "login"
							? "Se connecter"
							: "S'inscrire"}
					</Button>
				</form>

				{message && <p className="auth__msg">{message}</p>}
				{error && <p className="auth__err">{error}</p>}

				<button
					onClick={toggleMode}
					className="auth__switch"
					type="button"
				>
					{mode === "login"
						? "Pas encore inscrit ? S'inscrire"
						: "Déjà un compte ? Se connecter"}
				</button>
			</div>
		</div>
	);
}

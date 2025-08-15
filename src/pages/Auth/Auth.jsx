import { useState } from "react";
import { supabase } from "../../supabaseClient";
import Button from "../../components/Button/Button";
import "./Auth.scss";

export default function Auth() {
	const [mode, setMode] = useState("login"); // 'login' | 'signup'
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const toggleMode = () => {
		setMode(mode === "login" ? "signup" : "login");
		setError("");
		setMessage("");
		setPassword("");
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
				const { error } = await supabase.auth.signUp({
					email,
					password,
				});
				if (error) throw error;
				setMessage(
					"Inscription réussie. Vérifie tes e-mails pour confirmer."
				);
			} else {
				const { error } = await supabase.auth.signInWithPassword({
					email,
					password,
				});
				if (error) throw error;
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

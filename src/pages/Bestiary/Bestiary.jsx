import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import "./Bestiary.scss";

const Bestiary = () => {
	const [monsters, setMonsters] = useState([]);
	const [filteredMonsters, setFilteredMonsters] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Mapping des attributs basé sur le dernier chiffre de l'ID
	const getMonsterAttribute = (monsterId) => {
		const lastDigit = parseInt(monsterId.toString().slice(-1));
		const attributes = {
			1: "Water",
			2: "Fire",
			3: "Wind",
			4: "Light",
			5: "Dark",
		};
		return attributes[lastDigit] || "Unknown";
	};

	// État pour stocker les données complètes des monstres du fichier monstres.json
	const [monsterDataMap, setMonsterDataMap] = useState({});
	// État pour stocker l'ordre d'apparition des monstres dans monstres.json
	const [monsterOrderMap, setMonsterOrderMap] = useState({});

	// Charger les données des monstres depuis monstres.json
	useEffect(() => {
		const loadMonsterData = async () => {
			try {
				const response = await fetch("/monstres.json");
				const monstersData = await response.json();

				// Créer un mapping ID -> données complètes et ID -> ordre d'apparition
				const dataMap = {};
				const orderMap = {};
				monstersData.forEach((monster, index) => {
					dataMap[monster.com2usmonsterid] = {
						name: monster.title,
						image: monster.image_src,
					};
					// Stocker l'index (ordre d'apparition) pour chaque monstre
					orderMap[monster.com2usmonsterid] = index;
				});

				setMonsterDataMap(dataMap);
				setMonsterOrderMap(orderMap);
			} catch (error) {
				console.error(
					"Erreur lors du chargement des données de monstres:",
					error
				);
			}
		};

		loadMonsterData();
	}, []);

	// Fonction pour obtenir le nom du monstre basé sur l'ID
	const getMonsterName = (monsterId) => {
		return monsterDataMap[monsterId]?.name || "Monstre Inconnu";
	};

	// Fonction pour obtenir l'image du monstre basée sur l'ID
	const getMonsterImage = (monsterId) => {
		return monsterDataMap[monsterId]?.image || "/vite.svg";
	};

	// Fonction pour obtenir la couleur de l'attribut
	const getAttributeColor = (attribute) => {
		const colors = {
			Water: "#4facfe",
			Fire: "#ff0000ff",
			Wind: "#e68f2cff",
			Light: "#ffecd2",
			Dark: "#4e3990ff",
		};
		return colors[attribute] || "#888";
	};

	// Charger les monstres depuis la base de données Supabase
	useEffect(() => {
		// Attendre que les données de monstres.json soient chargées
		if (Object.keys(monsterDataMap).length === 0) {
			return;
		}

		const loadMonsters = async () => {
			try {
				setLoading(true);

				// Vérifier si l'utilisateur est connecté
				const {
					data: { user },
				} = await supabase.auth.getUser();

				if (!user) {
					throw new Error("Utilisateur non connecté");
				}

				// Récupérer les données JSON de l'utilisateur
				const { data, error } = await supabase
					.from("profiles")
					.select("json_data")
					.eq("id", user.id)
					.single();

				if (error) throw error;

				if (!data.json_data) {
					throw new Error(
						"Aucune donnée JSON trouvée. Veuillez importer un fichier JSON dans votre compte."
					);
				}

				// Vérifier et traiter les données JSON

				let monstersData = data.json_data;

				// Si les données ne sont pas directement un tableau, chercher les monstres
				if (!Array.isArray(data.json_data)) {
					if (
						typeof data.json_data === "object" &&
						data.json_data !== null
					) {
						// Chercher dans différentes propriétés possibles pour les monstres
						const possibleKeys = [
							"monsters",
							"monster",
							"data",
							"items",
							"list",
							"unit_list",
							"unit_list_map",
						];
						for (const key of possibleKeys) {
							if (Array.isArray(data.json_data[key])) {
								monstersData = data.json_data[key];

								break;
							}
						}

						// Si toujours pas de tableau trouvé, chercher des objets avec unit_master_id
						if (!Array.isArray(monstersData)) {
							// Chercher dans toutes les propriétés pour des objets contenant unit_master_id
							const findMonstersInObject = (obj, path = "") => {
								const monsters = [];
								for (const [key, value] of Object.entries(
									obj
								)) {
									if (Array.isArray(value)) {
										// Vérifier si c'est un tableau de monstres
										const monsterArray = value.filter(
											(item) =>
												item &&
												typeof item === "object" &&
												(item.unit_master_id ||
													item.com2usmonsterid)
										);
										if (monsterArray.length > 0) {
											monsters.push(...monsterArray);
										}
									} else if (
										value &&
										typeof value === "object"
									) {
										// Récursion pour chercher plus profondément
										monsters.push(
											...findMonstersInObject(
												value,
												`${path}.${key}`
											)
										);
									}
								}
								return monsters;
							};

							const foundMonsters = findMonstersInObject(
								data.json_data
							);
							if (foundMonsters.length > 0) {
								monstersData = foundMonsters;
							}
						}
					}
				}

				if (!Array.isArray(monstersData)) {
					// Vérifier si c'est des données de guilde
					if (data.json_data && data.json_data.guild) {
						throw new Error(
							"Les données JSON contiennent des informations de guilde, pas de monstres. Veuillez importer un fichier JSON contenant des monstres (format attendu: tableau avec com2usmonsterid, title, image_src)."
						);
					}

					throw new Error(
						"Les données JSON ne contiennent pas de tableau de monstres valide. Veuillez vérifier que vous avez importé le bon fichier JSON contenant les monstres (format attendu: tableau avec com2usmonsterid, title, image_src)."
					);
				}

				// Vérifier que les monstres ont les propriétés attendues
				if (monstersData.length > 0) {
					const firstMonster = monstersData[0];

					// Vérifier si le monstre a unit_master_id ou com2usmonsterid
					if (
						!firstMonster.unit_master_id &&
						!firstMonster.com2usmonsterid
					) {
						throw new Error(
							"Les données JSON ne contiennent pas les propriétés attendues (unit_master_id ou com2usmonsterid)"
						);
					}

					// Normaliser et filtrer les données : ne garder que les monstres présents dans monstres.json
					monstersData = monstersData
						.map((monster) => {
							const monsterId =
								monster.com2usmonsterid ||
								monster.unit_master_id;
							return {
								...monster,
								com2usmonsterid: monsterId,
								title:
									monster.title ||
									monster.name ||
									getMonsterName(monsterId),
								image_src:
									monster.image_src ||
									monster.image ||
									getMonsterImage(monsterId),
							};
						})
						.filter((monster) => {
							// Ne garder que les monstres dont l'ID existe dans monstres.json
							const existsInMonstresJson =
								monsterDataMap[monster.com2usmonsterid];
							if (!existsInMonstresJson) {
							}
							return existsInMonstresJson;
						});
				}

				// Trier les monstres selon leur ordre d'apparition dans monstres.json
				const sortedMonsters = monstersData.sort((a, b) => {
					const orderA =
						monsterOrderMap[a.com2usmonsterid] ??
						Number.MAX_SAFE_INTEGER;
					const orderB =
						monsterOrderMap[b.com2usmonsterid] ??
						Number.MAX_SAFE_INTEGER;
					return orderA - orderB;
				});

				// Les données JSON contiennent les monstres triés
				setMonsters(sortedMonsters);
				setFilteredMonsters(sortedMonsters);
				setError(null);
			} catch (err) {
				console.error("Erreur:", err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		loadMonsters();
	}, [monsterDataMap]);

	// Filtrer les monstres
	useEffect(() => {
		let filtered = monsters;

		// Filtre par terme de recherche
		if (searchTerm) {
			filtered = filtered.filter((monster) => {
				const title =
					monster.title || getMonsterName(monster.com2usmonsterid);
				return title.toLowerCase().includes(searchTerm.toLowerCase());
			});
		}

		// Trier les monstres filtrés
		const sortedFiltered = filtered.sort((a, b) => {
			if (searchTerm) {
				const titleA = (
					a.title || getMonsterName(a.com2usmonsterid)
				).toLowerCase();
				const titleB = (
					b.title || getMonsterName(b.com2usmonsterid)
				).toLowerCase();
				const searchLower = searchTerm.toLowerCase();

				// Prioriser les monstres qui commencent par le terme de recherche
				const startsWithA = titleA.startsWith(searchLower);
				const startsWithB = titleB.startsWith(searchLower);

				if (startsWithA && !startsWithB) return -1;
				if (!startsWithA && startsWithB) return 1;

				// Si les deux commencent par le terme ou aucun ne commence, trier par ordre alphabétique
				if (startsWithA === startsWithB) {
					return titleA.localeCompare(titleB);
				}
			}

			// Si pas de terme de recherche, trier par ordre d'apparition dans monstres.json
			const orderA =
				monsterOrderMap[a.com2usmonsterid] ?? Number.MAX_SAFE_INTEGER;
			const orderB =
				monsterOrderMap[b.com2usmonsterid] ?? Number.MAX_SAFE_INTEGER;
			return orderA - orderB;
		});

		setFilteredMonsters(sortedFiltered);
	}, [monsters, searchTerm, monsterOrderMap]);

	if (loading) {
		return (
			<div className="bestiary-container">
				<div className="loading">
					<h2>Chargement des monstres...</h2>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bestiary-container">
				<div className="error">
					<h2>Erreur</h2>
					<p>{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="bestiary-container">
			<div className="bestiary-header">
				<h1>Bestiaire</h1>
				<p className="monster-count">
					{filteredMonsters.length} monstre
					{filteredMonsters.length !== 1 ? "s" : ""} trouvé
					{filteredMonsters.length !== 1 ? "s" : ""}
				</p>
			</div>

			<div className="filters">
				<div className="search-container">
					<input
						type="text"
						placeholder="Rechercher un monstre..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="search-input"
					/>
				</div>
			</div>

			<div className="monsters-grid">
				{!Array.isArray(filteredMonsters) ||
				filteredMonsters.length === 0 ? (
					<div className="no-results">
						<p>
							{!Array.isArray(filteredMonsters)
								? "Erreur de format des données"
								: "Aucun monstre trouvé avec ces critères."}
						</p>
					</div>
				) : (
					filteredMonsters.map((monster, index) => {
						const attribute = getMonsterAttribute(
							monster.com2usmonsterid
						);

						return (
							<div
								key={`${monster.com2usmonsterid}-${index}`}
								className="monster-card"
							>
								<div className="monster-image-container">
									<img
										src={monster.image_src}
										alt={monster.title}
										className="monster-image"
										style={{
											backgroundColor:
												getAttributeColor(attribute),
										}}
										onError={(e) => {
											e.target.src = "/vite.svg"; // Image de fallback
										}}
									/>
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
};

export default Bestiary;

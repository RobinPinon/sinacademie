import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../supabaseClient";
import "./Search.scss";

export default function Search() {
  const [query, setQuery] = useState("");
  const [monsters, setMonsters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Sélections (IDs sous forme de string pour matcher monstres.json)
  const [sel1, setSel1] = useState("");
  const [sel2, setSel2] = useState("");
  const [sel3, setSel3] = useState("");

  // Défenses depuis la BDD
  const [defenses, setDefenses] = useState([]);
  const [loadingDefs, setLoadingDefs] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await fetch("/monstres.json");
        if (!res.ok) throw new Error("Impossible de charger monstres.json");
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Format JSON invalide");
        if (isMounted) setMonsters(data);
      } catch (e) {
        if (isMounted) setError(e.message || "Erreur inconnue");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Charger défenses de l'utilisateur connecté
  useEffect(() => {
    const fetchDefs = async () => {
      try {
        setLoadingDefs(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setDefenses([]);
          return;
        }
        const { data, error: err } = await supabase
          .from("defenses")
          .select("id, m1, m2, m3, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (err) throw err;
        setDefenses(data || []);
      } catch (e) {
        setError(e.message || "Erreur inconnue");
      } finally {
        setLoadingDefs(false);
      }
    };
    fetchDefs();
  }, []);

  const debouncedQuery = useDebouncedValue(query, 200);

  const filtered = useMemo(() => {
    if (!debouncedQuery) return monsters;
    const q = debouncedQuery.toLowerCase().trim();
    return monsters.filter((m) => (m.title || "").toLowerCase().includes(q));
  }, [monsters, debouncedQuery]);

  if (loading) return <div className="search"><p>Chargement…</p></div>;
  if (error) return <div className="search"><p className="error">{error}</p></div>;

  return (
    <div className="search">
      <h1>Défenses</h1>

      <div className="selectors">
        <MonsterSelect
          monsters={monsters}
          value={sel1}
          onChange={setSel1}
          label="Monstre 1"
          forbid={[sel2, sel3]}
        />
        <MonsterSelect
          monsters={monsters}
          value={sel2}
          onChange={setSel2}
          label="Monstre 2"
          forbid={[sel1, sel3]}
        />
        <MonsterSelect
          monsters={monsters}
          value={sel3}
          onChange={setSel3}
          label="Monstre 3"
          forbid={[sel1, sel2]}
        />
        <button className="btn" disabled={saving || !isTripleValid(sel1, sel2, sel3)} onClick={() => handleCreateDefenseInner({ sel1, sel2, sel3, setSaving, setDefenses, setError })}>
          {saving ? "Enregistrement…" : "Enregistrer la défense"}
        </button>
      </div>

      <DefenseList
        monsters={monsters}
        defenses={filterDefenses(defenses, [sel1, sel2, sel3])}
      />
    </div>
  );
}

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function isTripleValid(a, b, c) {
  if (!a || !b || !c) return false;
  return a !== b && a !== c && b !== c;
}

function filterDefenses(defs, selection) {
  const selected = selection.filter(Boolean);
  if (selected.length === 0) return defs;
  return defs.filter((d) => {
    const ids = [String(d.m1), String(d.m2), String(d.m3)];
    return selected.every((s) => ids.includes(String(s)));
  });
}

function DefenseList({ monsters, defenses }) {
  const map = useMemo(() => {
    const m = new Map();
    monsters.forEach((x) => m.set(String(x.com2usmonsterid), x));
    return m;
  }, [monsters]);

  if (!defenses || defenses.length === 0) {
    return <div className="defs"><p>Aucune défense.</p></div>;
  }

  return (
    <div className="defs">
      {defenses.map((d) => {
        const ids = [String(d.m1), String(d.m2), String(d.m3)];
        return (
          <div key={d.id} className="def">
            {ids.map((id) => {
              const m = map.get(id);
              return (
                <div key={id} className="def__card">
                  <img src={m?.image_src || "/vite.svg"} alt={m?.title || id} onError={(e) => { e.currentTarget.src = "/vite.svg"; }} />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function MonsterSelect({ monsters, value, onChange, label, forbid = [] }) {
  const forbidden = new Set(forbid.filter(Boolean).map(String));
  const options = useMemo(() => monsters, [monsters]);
  return (
    <label className="selector">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">— Choisir —</option>
        {options.map((m) => (
          <option key={m.com2usmonsterid} value={m.com2usmonsterid} disabled={forbidden.has(String(m.com2usmonsterid))}>
            {m.title}
          </option>
        ))}
      </select>
    </label>
  );
}

async function handleCreateDefenseInner({ sel1, sel2, sel3, setSaving, setDefenses, setError }) {
  try {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Utilisateur non connecté");

    const payload = {
      m1: Number(sel1),
      m2: Number(sel2),
      m3: Number(sel3),
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from("defenses")
      .insert(payload)
      .select("id, m1, m2, m3, created_at")
      .single();
    if (error) throw error;
    setDefenses((prev) => [data, ...prev]);
  } catch (e) {
    setError(e.message || "Erreur inconnue");
  } finally {
    setSaving(false);
  }
}

function handleCreateDefense() {}



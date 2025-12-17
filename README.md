# Guide d'Installation - macOS

Ce guide vous explique comment installer l'application **Pension pour Chats** sur un ordinateur macOS, de A à Z.

## ⏱️ Estimation du Temps

- **Première installation complète** : **30 à 45 minutes**
  - Installation de Java 21 : 10-15 min
  - Installation de Maven : 5-10 min
  - Téléchargement du projet : 2-5 min
  - Compilation : 10-15 min
  - Configuration initiale : 2-5 min

- **Installations suivantes** : **5 à 10 minutes**
  - Copie des fichiers : 2-3 min
  - Vérification : 1-2 min
  - Premier lancement : 2-5 min

---

## 📋 Prérequis

Avant de commencer, vous aurez besoin de :
- Un Mac avec macOS 10.15 (Catalina) ou plus récent
- Une connexion Internet
- Un compte administrateur sur le Mac
- Environ 500 Mo d'espace disque libre

---

## 🔧 Étape 1 : Installation de Java 21

L'application nécessite **Java 21** (JDK) pour fonctionner.

### Option A : Installation via Homebrew (Recommandé)

1. **Installer Homebrew** (si ce n'est pas déjà fait) :
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
   ⏱️ **Temps estimé** : 5-10 minutes

2. **Installer Java 21** :
   ```bash
   brew install openjdk@21
   ```

3. **Configurer Java dans le PATH** :
   ```bash
   echo 'export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```
   
   > **Note** : Si vous utilisez une version ancienne de macOS ou un Mac Intel (au lieu d'Apple Silicon), le chemin peut être `/usr/local/opt/openjdk@21/bin` au lieu de `/opt/homebrew/opt/openjdk@21/bin`.

4. **Vérifier l'installation** :
   ```bash
   java -version
   ```
   Vous devriez voir quelque chose comme :
   ```
   openjdk version "21.x.x"
   ```

⏱️ **Temps estimé** : 10-15 minutes

### Option B : Installation manuelle via Oracle/Adoptium

1. **Télécharger Java 21** :
   - Visitez : https://adoptium.net/temurin/releases/?version=21
   - Sélectionnez **macOS** et **x64** (ou **aarch64** pour Apple Silicon)
   - Téléchargez le fichier `.pkg`

2. **Installer le package** :
   - Double-cliquez sur le fichier `.pkg` téléchargé
   - Suivez les instructions de l'installateur

3. **Vérifier l'installation** :
   ```bash
   java -version
   ```

⏱️ **Temps estimé** : 10-15 minutes

---

## 📦 Étape 2 : Installation de Maven

Maven est nécessaire pour compiler l'application.

### Installation via Homebrew

```bash
brew install maven
```

### Vérifier l'installation

```bash
mvn -version
```

Vous devriez voir quelque chose comme :
```
Apache Maven 3.x.x
```

⏱️ **Temps estimé** : 5-10 minutes

---

## 📥 Étape 3 : Téléchargement du Projet

### Option A : Cloner depuis GitHub (Recommandé)

1. **Ouvrir le Terminal** (Applications > Utilitaires > Terminal)

2. **Naviguer vers le dossier où vous voulez installer l'application** :
   ```bash
   cd ~/Documents
   # ou
   cd ~/Desktop
   ```

3. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/Ekapsos/pension-chat.git
   ```

4. **Entrer dans le dossier du projet** :
   ```bash
   cd pension-chat/pension-chat
   ```

⏱️ **Temps estimé** : 2-5 minutes

### Option B : Télécharger le ZIP

1. **Télécharger le ZIP** depuis GitHub :
   - Allez sur : https://github.com/Ekapsos/pension-chat
   - Cliquez sur **Code** > **Download ZIP**

2. **Extraire le fichier ZIP** :
   - Double-cliquez sur le fichier téléchargé
   - Ouvrez le Terminal et naviguez vers le dossier extrait :
   ```bash
   cd ~/Downloads/pension-chat-main/pension-chat
   ```

⏱️ **Temps estimé** : 2-5 minutes

---

## 🔨 Étape 4 : Compilation de l'Application

1. **Dans le Terminal, depuis le dossier `pension-chat`**, exécutez :
   ```bash
   mvn clean package
   ```

   Cette commande va :
   - Télécharger toutes les dépendances (première fois uniquement)
   - Compiler le code source
   - Créer un fichier JAR exécutable

   ⏱️ **Temps estimé** : 10-15 minutes (première fois, car téléchargement des dépendances)
   ⏱️ **Temps estimé** : 3-5 minutes (compilations suivantes)

2. **Vérifier que le JAR a été créé** :
   ```bash
   ls -lh target/pension-chat-1.0-SNAPSHOT.jar
   ```

   Vous devriez voir un fichier d'environ 30-50 Mo.

---

## 🚀 Étape 5 : Premier Lancement

1. **Lancer l'application** :
   ```bash
   java -jar target/pension-chat-1.0-SNAPSHOT.jar
   ```

2. **À la première connexion** :
   - **Nom d'utilisateur** : `admin`
   - **Mot de passe** : Consultez le fichier `ADMIN_PASSWORD.txt` à la racine du projet
     > ⚠️ **Important** : Si le fichier n'existe pas, contactez l'administrateur pour obtenir le mot de passe.

3. **Changer le mot de passe** :
   - Une fois connecté, allez dans **Gestion des utilisateurs**
   - Modifiez le mot de passe de l'utilisateur `admin`

⏱️ **Temps estimé** : 2-5 minutes

---

## 📁 Structure des Fichiers Importants

Après la première exécution, l'application créera automatiquement :

```
pension-chat/
├── data/
│   └── pension-chats.mv.db          # Base de données (à sauvegarder !)
├── config/
│   └── database.properties           # Configuration de la base de données
├── target/
│   └── pension-chat-1.0-SNAPSHOT.jar # Application compilée
└── backups/                          # Sauvegardes automatiques (si configuré)
```

---

## 🔄 Installations Suivantes (Mise à Jour)

Une fois que vous avez compilé l'application une première fois, les installations suivantes sont **beaucoup plus simples** :

### Méthode Rapide : Copie des Fichiers

1. **Sur votre Mac de développement** (où vous avez compilé) :
   - Copiez le fichier `target/pension-chat-1.0-SNAPSHOT.jar`
   - Copiez le dossier `data/` (si vous voulez conserver les données)
   - Copiez le dossier `config/` (si vous avez des configurations personnalisées)

2. **Sur le nouveau Mac** :
   - Installez Java 21 (voir Étape 1)
   - Créez un dossier pour l'application :
     ```bash
     mkdir -p ~/Applications/PensionChat
     cd ~/Applications/PensionChat
     ```
   - Collez les fichiers copiés

3. **Lancer l'application** :
   ```bash
   java -jar pension-chat-1.0-SNAPSHOT.jar
   ```

⏱️ **Temps estimé** : 5-10 minutes

### Méthode Complète : Recompilation

Si vous préférez recompiler (par exemple après une mise à jour du code) :

1. **Cloner/télécharger la nouvelle version** du projet
2. **Exécuter** :
   ```bash
   mvn clean package
   ```
3. **Lancer** :
   ```bash
   java -jar target/pension-chat-1.0-SNAPSHOT.jar
   ```

⏱️ **Temps estimé** : 10-15 minutes

---

## 🎯 Créer un Raccourci (Optionnel)

Pour faciliter le lancement, vous pouvez créer un script de lancement :

1. **Créer un fichier `lancer-pension.sh`** :
   ```bash
   nano ~/Applications/PensionChat/lancer-pension.sh
   ```

2. **Ajouter le contenu suivant** :
   ```bash
   #!/bin/bash
   cd ~/Applications/PensionChat
   java -jar pension-chat-1.0-SNAPSHOT.jar
   ```

3. **Rendre le script exécutable** :
   ```bash
   chmod +x ~/Applications/PensionChat/lancer-pension.sh
   ```

4. **Lancer l'application** :
   ```bash
   ~/Applications/PensionChat/lancer-pension.sh
   ```

---

## 🔍 Dépannage

### Problème : "java: command not found"

**Solution** : Java n'est pas dans le PATH. Vérifiez :
```bash
which java
java -version
```

Si cela ne fonctionne pas, réinstallez Java (voir Étape 1).

### Problème : "mvn: command not found"

**Solution** : Maven n'est pas installé. Installez-le :
```bash
brew install maven
```

### Problème : Erreur lors de la compilation Maven

**Solutions possibles** :
- Vérifiez votre connexion Internet (Maven doit télécharger les dépendances)
- Vérifiez que Java 21 est bien installé : `java -version`
- Essayez de nettoyer et recompiler : `mvn clean install`

### Problème : L'application ne se lance pas

**Solutions possibles** :
- Vérifiez que le JAR existe : `ls -lh target/pension-chat-1.0-SNAPSHOT.jar`
- Vérifiez les permissions : `chmod +x target/pension-chat-1.0-SNAPSHOT.jar`
- Lancez avec plus de détails : `java -jar -Xmx2g target/pension-chat-1.0-SNAPSHOT.jar`

### Problème : Erreur de base de données

**Solution** : Supprimez le dossier `data/` et relancez l'application (cela recréera une base de données vierge) :
```bash
rm -rf data/
java -jar target/pension-chat-1.0-SNAPSHOT.jar
```
⚠️ **Attention** : Cela supprimera toutes vos données !

---

## 📝 Résumé des Commandes Essentielles

```bash
# Vérifier Java
java -version

# Vérifier Maven
mvn -version

# Compiler l'application
mvn clean package

# Lancer l'application
java -jar target/pension-chat-1.0-SNAPSHOT.jar

# Créer un dossier pour l'application
mkdir -p ~/Applications/PensionChat
```

---

## ✅ Checklist d'Installation

- [ ] Java 21 installé et vérifié
- [ ] Maven installé et vérifié
- [ ] Projet téléchargé/cloné
- [ ] Application compilée avec succès (`mvn clean package`)
- [ ] JAR créé dans `target/`
- [ ] Application lancée avec succès
- [ ] Connexion réussie avec le compte admin
- [ ] Mot de passe admin modifié

---

## 📞 Support

Si vous rencontrez des problèmes non résolus par ce guide :
1. Vérifiez les messages d'erreur dans le Terminal
2. Consultez les logs de l'application (si disponibles)
3. Contactez l'administrateur du projet

---

**Bon courage avec l'installation ! 🐱**


// ce fichier est structuré de manière à simulier un pattern "Singleton" (en tenant compte des limitations du JS)

// Import de la feuille de style
import '../assets/css/style.css';
import { PostIt } from './PostIt';

// La class n'est pas exportée, ce qui empêche de l'importer et de l'instancier
// C'est l'équivalent du constructeur privé en PHP
class App {

    /**
     * Champ titre du formulaire d'ajout
     */
    elInputNewPiTitle;
    /**
     * Champ contenu du formulaire d'ajout
     */
    elTextareaNewPiContent;
    /**
     * Conteneur des post-its
     */
    elOlPiList;

    /**
     * Tableau de travail contenant la liste réelle des Post-Its
     */
    arrPostIt = [];

    /**
     * Données d'un post-it avant édition
     */
    backupPostItData = null;

    /**
     * Démarreur de l'application
     */
    start(){
        console.log( 'Application démarrée ...' );

        // rendu de l'interface Utilisateur
        this.renderBaseUI();

        // Pose des des écouteurs de post-its
        this.initPostItListeners();  
    }

    /**
     * Initialise les écouteurs des évènements emis par les Post-Its
     */
    initPostItListeners() {
        // Edition
        document.addEventListener('pi.edit', this.handlerOnPiEdit.bind(this));
        // Supression d'un Post-It
        document.addEventListener('pi.delete', this.handlerOnPiDelete.bind(this));
        // Sauvegarde
        document.addEventListener('pi.save', this.handlerOnPiSave.bind(this));
        // Annulation
        document.addEventListener('pi.cancel', this.handlerOnPiCancel.bind(this));
        
    }

    /**
     * Effectue le rendu de l'UI de bas
     */
    renderBaseUI(){
        /**
         Template:

         <header>
            <h1>Post-It</h1>

            <form novalidate>
                <input type:"text" placeholder="Titre">
                <textarea placeholder="Contenu"></textarea>
                <button type="button">➕</button>
            </form>

            <div>
                <button type="button">🗑️</button>
            </div>
        </header>

        <main>
            <ol id="nota-list"></ol>
        </main>
         */

        // -- <header>
        const elHeader = document.createElement('header');
        elHeader.innerHTML = `<h1>Post-Its</h1>`;

        // - <form novalidate>
        const elForm = document.createElement( 'form' );
        elForm.noValidate = true;
        elForm.addEventListener( 'submit', this.handlerAddNewPostIt.bind(this) );

        // <input type="text" placeholder="Titre">
        this.elInputNewPiTitle = document.createElement( 'input' );
        this.elInputNewPiTitle.type = 'text';
        this.elInputNewPiTitle.placeholder = 'Titre';
        this.elInputNewPiTitle.addEventListener( 'focus', this.handlerRemoveError.bind( this ) );
        this.elInputNewPiTitle.addEventListener( 'input', this.handlerRemoveError.bind( this ) );
 
        // <textarea placeholder="Contenu"></textarea>
        this.elTextareaNewPiContent = document.createElement( 'textarea' );
        this.elTextareaNewPiContent.placeholder = 'Contenu';
        this.elTextareaNewPiContent.addEventListener( 'focus', this.handlerRemoveError.bind( this ) );
        this.elTextareaNewPiContent.addEventListener( 'input', this.handlerRemoveError.bind( this ) );

        // <button type="button">➕</button>
        const elBtnNewPiAdd = document.createElement( 'button' );
        elBtnNewPiAdd.type = 'button';
        elBtnNewPiAdd.textContent = '➕';
        // .bind( this ) permet de faire en sorte que le contexte du handler soit toujours App (au lieu du boutton)
        elBtnNewPiAdd.addEventListener( 'click', this.handlerAddNewPostIt.bind( this ) );

        // Injection <input>+<textarea>+<button> dans <form>
        elForm.append( this.elInputNewPiTitle, this.elTextareaNewPiContent, elBtnNewPiAdd );

        // - <div>
        const elDivClear = document.createElement( 'div' );

        // <button type="button">🗑️</button>
        const elBtnClear = document.createElement( 'button' );
        elBtnClear.type = 'button';
        elBtnClear.textContent = '🗑️';
        elBtnClear.addEventListener( 'click', this.handlerClear.bind( this ));

        // Injection de <button> dans <div>
        elDivClear.append( elBtnClear );

        // Injection <form>+<div> dans <header>
        elHeader.append( elForm, elDivClear );

        // -- <main>
        const elMain = document.createElement( 'main' );

        // - <ol id="nota-list"></ol>
        this.elOlPiList = document.createElement( 'ol' );
        this.elOlPiList.id = 'nota-list';

        // Injection <ol> dans <main>
        elMain.append( this.elOlPiList );

        //  -- Injection <header>+<main> dans <body>
        document.body.append( elHeader, elMain );
    }

    /**
     * Effectue le rendu de a liste des Post-Its
     */
    renderList(){
        // 1 - Vider le <ol> de la liste
        this.elOlPiList.innerHTML = '';

        // 2 - Reconstruire la liste à partir du Tableau de Post-Its
        // for( let postIt of this.arrPostIt ){
        //     let elPostIt = postIt.getDOM();
        //     this.elPostIt.append( elPostIt );
        // }
        // Version Senior dev
        for( let postIt of this.arrPostIt ) 
            this.elOlPiList.append( postIt.getDOM() );
    }

    /**
     * Gestionnaire d'ajout d'un nouveau Post-It
     * 
     * @param {Event} evt Evénement produit intercepté par l'écouteur 
     */
    handlerAddNewPostIt( evt ){
        // Annuler le comportement par défaut de l'événement (utile pour bloquer l'envoi de "submit")
        evt.preventDefault();

        // Récupérer la saisie 
        let newTitle = this.elInputNewPiTitle.value;
        let newContent = this.elTextareaNewPiContent.value;
        let now = Date.now();
        
        // Vérifier la saisie
        // "Flag" => drapeau qui indique la présence d'une erreur
        let hasError = false;

        // \S == autre chose que des espaces ou rien
        const regExpNotEmty = new RegExp( '\\S' ); // '\\S' == /\S/ 
        // Si newTitle ne passe pas le test
        if( !regExpNotEmty.test( newTitle) ){
            hasError = true;
            this.elInputNewPiTitle.value = '';
            this.elInputNewPiTitle.classList.add( 'error' );
        }

        // Si newContent ne passe pas le test
        if( !regExpNotEmty.test( newContent) ){
            hasError = true;
            this.elTextareaNewPiContent.value = '';
            this.elTextareaNewPiContent.classList.add( 'error' );
        }

        // Si il y a eu une erreur, on arrête ici
        if( hasError ) return;
        
        // 1 - Créer une version litérale du Post-It avec des données du formulaire
        const newPostItLiteral = {
            title: newTitle,
            content: newContent,
            dateCreate: now,
            dateUpdate: now
        };

        // 2 - Créer une instance de la classe Post-Its
        const newPostIt = new PostIt( newPostItLiteral );

        // 3 - Ajoute l'instance au tableau de travail 
        this.arrPostIt.unshift( newPostIt );

        // 4 - Reconstruit le contenu de la liste
        this.renderList();

        // 5 - Vider les champs du formulaire
        this.elInputNewPiTitle.value = '';
        this.elTextareaNewPiContent.value = '';
    }

    /**
     * Gestionnaire de suppresion de l'état "erreur" d'un champ de formulaire
     * 
     * @param {Event} evt 
     */
    handlerRemoveError( evt ){
        // Récupérer le champ concerné
        let elField = evt.target;

        elField.classList.remove( 'error' );
    }

    /**
     * Gestionnaire de nettoyage du tableau
     * 
     * @param {Event} evt Evénement produir intercepté par l'écouteur 
     */
    handlerClear( evt ){
        // 1 - Vider le tableau de la liste des Post-Its
        this.arrPostIt = [];

        // 2 - Regéner la liste à l'affichage
        this.renderList();
    }
    
    /**
     * Gestionnaire de sauvegarde d'un Post-It
     * 
     * @param {CustomEvent} evt 
     */
    handlerOnPiSave( evt ) {
        const postIt = evt.detail.emitter;
    }

    /**
     * Gestionnaire d'annulation d'un Post-It
     * 
     * @param {CustomEvent} evt 
     */
    handlerOnPiCancel( evt ) {
        const postIt = evt.detail.emitter;
        
        // Passage en mode vue du post-it
        postIt.setViewMode();

        // On remet les données depuis le backup
        postIt.containerTitle.textContent = this.backupPostItData.title;
        postIt.containerContent.textContent = this.backupPostItData.content;

        // On réintialise le backup
        this.backupPostItData = null;
    }

    /**
     * Gestionnaire d'édition d'un Post-It
     * 
     * @param {CustomEvent} evt 
     */
    handlerOnPiEdit( evt ) {
        // Si  on est déjà en train d'éditer un post-it, on restort
        if( this.backupPostItData !== null ) return;

        const postIt = evt.detail.emitter;

        // On crée une copie des données du post-it en cas d'annulation
        this.backupPostItData = postIt.toJSON();
        
        // Passage en mode edition
        postIt.setEditMode();
    }

    /**
     * Gestionnaire de suppression d'un Post-It
     * 
     * @param {CustomEvent} evt 
     */
    handlerOnPiDelete( evt ) {
        // Si  on est déjà en train d'éditer un post-it, on restort
        if( this.backupPostItData !== null ) return;

        const postIt = evt.detail.emitter;
        // Array filter retourne un tableau des Post-It sans celui que l'on veut supprimer 
        const arrListAfterDelete = this.arrPostIt.filter( pi => ! Object.is( postIt, pi ));
        // On réaffecte le tableau de Post-it avec ce nouveau tableau
        this.arrPostIt = arrListAfterDelete;
        // On refait l'affichage
        this.renderList();
    }



}

// On crée une instance de App dans une variable
// La variable est l'équivalent de la propriété static "$instance" en PHP
const app = new App();

// On exporte cette variable
// Si à l'exterieur il y a plusieurs imports de cette variable,
// Le système aura mémorisé le premier, et pour les suivants donnera ce qui a été mémorisé
// c'est l'équivalent de la méthode statique "getApp" en PHP 
export default app;
// Constantes "privées", visibles uniquement dans ce fichier car non-exportées
const MODE_VIEW = 'view';
const MODE_EDIT = 'edit';

/* Modèle objet litteral d'un Post-It
{
    title: 'Toto à la plage',
    content: 'Il nage le crawl au milieu des requins',
    dateCreate: 1666180099794,
    dateUpdate: 1666180099794
}
*/
export class PostIt{

    /**
     * données : Titre
     */
    title;
    /**
     * donées : Contenu
     */
    content;
    /**
     * Données : TimeStamp JS de création
     */
    dateCreate;
    /**
     * Donées : TimeStamp JS de modification
     */
    dateUpdate;
    /**
     * Objet de detail ajouté aux évenements émsis par les actions
     */
    eventDetail;
    /**
     * Élément DOM de Post-It
     */
    container = null;

    /**
     * Elément DOM du titre du post-it
     */
    containerTitle = null;
    /**
     * Elément DOM du content du post-it
     */
    containerContent = null;

    constructor( postIdLiteral ){
        this.title = postIdLiteral.title;
        this.content = postIdLiteral.content;
        this.dateCreate = postIdLiteral.dateCreate;
        this.dateUpdate = postIdLiteral.dateUpdate;

        // Objet "detail" pour l'événement personnalisé des actions sut le post-it
        this.eventDetail =  { detail: { emitter: this }}; 
    }

    /**
     * Créé de le DOM pour un Post-It
     * 
     * @returns {HTMLElement} Elément DOM conteneur du Post-It
     */
    getDOM(){
        // S'il a déjà été créé, on le retourne 
        if( this.container !== null ) return this.container;

        // Sinon on fabrique le DOM
        /* 
        Template :
        <li>
            <div class="nota-header">
                <div class="nota-times">
                    <strong>création: </strong>LA_DATE<br>
                    <strong>màj: </strong>LA_DATE
                </div>
                <div class="nota-cmd">
                    <div data-cmd="view">
                        <button type="button" data-role="edit">✏️</button>
                        <button type="button" data-role="delete">🗑️</button>
                    </div>
                    <div data-cmd="edit">
                        <button type="button" data-role="save">💾</button>
                        <button type="button" data-role="cancel">❌</button>
                    </div>
                </div>
            </div>
            <div class="nota-title">THE_TITLE</div>
            <div class="nota-content">THE_CONTENT</div>
        </li>
        */
       this.container = document.createElement( 'li' );
       this.container.classList.add( 'nota' );
       this.container.dataset.mode = MODE_VIEW;

       // Dates formatées
       let dateCreate = new Date( this.dateCreate ).toLocaleString();
       let dateUpdate = new Date( this.dateUpdate ).toLocaleString();

       let innerDom = "";
       innerDom += '<div class="nota-header">';
       innerDom += '    <div class="nota-times">';
       innerDom +=         `<strong>création: </strong>${dateCreate}<br>`;
       innerDom +=         `<strong>update: </strong>${dateUpdate}`;
       innerDom += '    </div>';
       innerDom += '    <div class="nota-cmd">';
       innerDom += '        <div data-cmd="view">';
       innerDom += '            <button type="button" data-role="edit">✏️</button>';
       innerDom += '            <button type="button" data-role="delete">🗑️</button>';
       innerDom += '        </div>';
       innerDom += '        <div data-cmd="edit">';
       innerDom += '            <button type="button" data-role="save">💾</button>';
       innerDom += '            <button type="button" data-role="cancel">❌</button>';
       innerDom += '        </div>';
       innerDom += '    </div>';
       innerDom += '</div>';
        // Ajout du contenu 
       this.container.innerHTML = innerDom;

       // <div class="nota-title">
       this.containerTitle = document.createElement( 'div' );
       this.containerTitle.classList.add( 'nota-title' );
       this.containerTitle.textContent = this.title;
       
       // <div class="nota-content">
       this.containerContent = document.createElement( 'div' );
       this.containerContent.classList.add( 'nota-content' );
       this.containerContent.textContent = this.content;

       //  
       this.container.append( this.containerTitle, this.containerContent );

       //Ecouteur du click
       this.container.addEventListener( 'click', this.handlerButtons.bind(this) );    

       return this.container
    }

    /**
     * Passe le DOM du Post-It en mode édition
     */
    setEditMode(){
        this.container.dataset.mode = MODE_EDIT;
        this.containerTitle.contentEditable = true;
        this.containerContent.contentEditable = true;
    }

    /**
     * Passe le DOM du Post-It en mode view
     */
    setViewMode(){
        this.container.dataset.mode = MODE_VIEW;
        this.containerTitle.contentEditable = false;
        this.containerContent.contentEditable = false;
    }

    /**
     * Action du bouton d'édition
     */
    commandEdit(){
        const editEvent  = new CustomEvent( 'pi.edit', this.eventDetail );
        document.dispatchEvent( editEvent );
    }

     /**
     * Action du bouton de suppression
     */
    commandDelete(){
        const deleteEvent  = new CustomEvent( 'pi.delete', this.eventDetail );
        document.dispatchEvent( deleteEvent );
    }

     /**
     * Action du bouton de sauvgarde
     */
    commandSave(){
        const saveEvent  = new CustomEvent( 'pi.save', this.eventDetail );
        document.dispatchEvent( saveEvent );
    }

     /**
     * Action du bouton d'annulation
     */
    commandCancel(){
        const cancelEvent  = new CustomEvent( 'pi.cancel', this.eventDetail );
        document.dispatchEvent( cancelEvent );
    }

    /**
     * Donne la forme que doit avoir le post-it en literal ( utilisé par JSON.stringify() )
     * @returns Forme literale du Post-It
     */
    toJSON(){
        return{
            title: this.title,
            content: this.content,
            dateCreate: this.dateCreate,
            dateUpdate: this.dateUpdate
        }
    }

    /**
     * Gestionnaire des bouttons du post-it
     * 
     * @param {Event} evt 
     */
    handlerButtons( evt ){
        const elTarget = evt.target;
        const role = elTarget.dataset.role;

        // En fonction du role, on fait des choses différentes
        switch( role ){
            case 'delete':
                this.commandDelete();
                break;
                
            case 'save':
                this.commandSave();
                break;

            case 'cancel':
                this.commandCancel();
                break;

            case 'edit':
                this.commandEdit();
                break;

            default:
                break;
        }
    }
}
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

    title;
    content;
    dateCreate;
    dateUpdate;
    eventDetail;

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
       const elLi = document.createElement( 'li' );
       elLi.classList.add( 'nota' );
       elLi.dataset.mode = MODE_VIEW;

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
       innerDom += `<div class="nota-title">${this.title}</div>`;
       innerDom += `<div class="nota-content">${this.content}</div>`;
        // Ajout du contenu 
       elLi.innerHTML = innerDom;

       //Ecouteur du click
       elLi.addEventListener( 'click', this.handlerButtons.bind(this) );    

       return elLi
    }

    /**
     * Action du bouton d'édition
     */
    commandEdit(){
        console.log( 'Edition...' );
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
        console.log( 'Sauvegarde...' );
    }

     /**
     * Action du bouton d'annulation
     */
    commandCancel(){
        console.log( 'Annulation...' );
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
                console.log( elTarget );
        }
    }
}
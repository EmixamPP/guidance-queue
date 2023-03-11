Le site web a été créé en utilisant le framework Bootstrap 5. 

La page principale est accessible via `index.html` . Tant dis que l'espace administrateur est donné par `admin.html`

L'adresse du serveur (actuellement `wss://guidance.emixam.be/server`) doit être modifiée dans les fichiers `assets/js/admin.js` et `assets/js/student.js`.

Un fichier `nginx.conf` est présent afin de le configurer sur un serveur nginx. Note: à ne pas confondre avec le serveur utilisé pour l'application, i.e. Node.js. 

Attention, le navigateur ne doit pas ce mettre en veille. Sinon la connexion avec le serveur sera interrompue. Il faudra alors se reconnecter dans le cas de l'administrateur, ou se remettre dans la file d'attente dans le cas de l'étudiant. L'API Wake Lock est implémentée afin d'empêcher la mise en veille automatique.  

La page `admin.html` demandera les droits pour envoyer des notifications, cela permet de ne pas devoir regarder constament la page, et de recevoir une notification quand la file n'est plus vide (donc pas de notitification s'il y a déjà des tickets dans la file).

Les fichiers non pas été minifier sur git afin de rester lisible. Pensez à le faire avant de mettre en production le site.
Le site web a été créé en utilisant le framework Bootstrap 5. 

La page principale est accessible via `index.html` . Tant dis que l'espace administrateur est donné par `admin.html`

L'adresse du serveur (actuellement `wss://guidance.emixam.be/server`) doit être modifiée dans les fichiers `assets/js/admin.js` et `assets/js/student.js`.

Un fichier `nginx.conf` est présent afin de le configurer sur un serveur nginx. Note: à ne pas confondre avec le serveur utilisé pour l'application, i.e. Node.js. 

Attention, le navigateur ne doit pas ce mettre en veille. Sinon la connexion avec le serveur sera interrompue. Il faudra alors se reconnecter dans le cas de l'administrateur, ou se remettre dans la file d'attente dans le cas de l'étudiant.

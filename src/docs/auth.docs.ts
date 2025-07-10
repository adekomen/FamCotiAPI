/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Gestion de l’authentification
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Enregistrer un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Franc ADESU"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "adesu@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "motdepassefort"
 *     responses:
 *       201:
 *         description: Utilisateur enregistré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Erreurs de validation
 *       409:
 *         description: Email déjà utilisé
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion d’un utilisateur existant
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "adesu@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "motdepassefort"
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Erreurs de validation
 *       401:
 *         description: Identifiants incorrects
 *       403:
 *         description: Compte désactivé
 */

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Modifier le mot de passe de l'utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: "ancienMotDePasse"
 *               newPassword:
 *                 type: string
 *                 example: "nouveauMotDePasseFort"
 *     responses:
 *       200:
 *         description: Mot de passe mis à jour avec succès
 *       400:
 *         description: Erreurs de validation
 *       401:
 *         description: Mot de passe actuel incorrect ou utilisateur non authentifié
 *       404:
 *         description: Utilisateur introuvable
 */

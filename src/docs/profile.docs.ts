/**
 * @swagger
 * tags:
 *   name: Profiles
 *   description: Gestion des profils utilisateurs
 */

/**
 * @swagger
 * /profiles:
 *   post:
 *     summary: Créer un nouveau profil
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               phoneNumber:
 *                 type: string
 *                 example: "+22890123456"
 *               address:
 *                 type: string
 *                 example: "Lomé, Togo"
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1995-05-20"
 *               profilePhotoPath:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/images/photo.jpg"
 *               isMarried:
 *                 type: boolean
 *                 example: false
 *               isEmployed:
 *                 type: boolean
 *                 example: true
 *               isCivilServant:
 *                 type: boolean
 *                 example: false
 *               parentId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Profil créé avec succès
 *       400:
 *         description: Erreur de validation
 *       403:
 *         description: Accès non autorisé
 *       409:
 *         description: Profil déjà existant
 */

/**
 * @swagger
 * /profiles:
 *   get:
 *     summary: Obtenir tous les profils (admin uniquement)
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des profils
 *       403:
 *         description: Accès refusé
 */

/**
 * @swagger
 * /profiles/{id}:
 *   get:
 *     summary: Obtenir un profil par son ID
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du profil
 *     responses:
 *       200:
 *         description: Profil trouvé
 *       403:
 *         description: Accès non autorisé
 *       404:
 *         description: Profil introuvable
 */

/**
 * @swagger
 * /profiles/{id}:
 *   put:
 *     summary: Mettre à jour un profil
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du profil à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "+22890123456"
 *               address:
 *                 type: string
 *                 example: "Lomé, Togo"
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1995-05-20"
 *               profilePhotoPath:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/photo.jpg"
 *               isMarried:
 *                 type: boolean
 *                 example: false
 *               isEmployed:
 *                 type: boolean
 *                 example: true
 *               isCivilServant:
 *                 type: boolean
 *                 example: false
 *               parentId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Profil mis à jour
 *       403:
 *         description: Accès non autorisé
 *       404:
 *         description: Profil introuvable
 */

/**
 * @swagger
 * /profiles/{id}:
 *   delete:
 *     summary: Supprimer un profil (admin uniquement)
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du profil
 *     responses:
 *       200:
 *         description: Profil supprimé
 *       403:
 *         description: Accès non autorisé
 *       404:
 *         description: Profil introuvable
 */

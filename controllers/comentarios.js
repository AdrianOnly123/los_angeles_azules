const express = require('express');
const router = express.Router();
const {verifyToken} = require('../controllers/middlewares/auth');
const comCtrl = require('../controllers/comentarioController');

router.get('/', comCtrl.list);
router.post('/', verifyToken, comCtrl.create);
router.put('/:id', verifyToken, comCtrl.update);
router.delete('/:id', verifyToken, comCtrl.remove);

module.exports = router;

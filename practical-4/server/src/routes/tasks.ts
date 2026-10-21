import { Router } from 'express';
import { createTask, deleteTask, getAllTasks, updateTask } from '../controllers/taskController';
import { requireJson } from '../middleware/requireJson';
import { validateId } from '../middleware/validateId';

const router = Router();

router.get('/', getAllTasks);
router.post('/', requireJson, createTask);
router.put('/:id', validateId, requireJson, updateTask);
router.delete('/:id', validateId, deleteTask);

export default router;

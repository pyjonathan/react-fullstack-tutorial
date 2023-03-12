const express = require("express");
const router = express.Router();
const ToDo = require("../models/ToDo");
const requiresAuth = require("../middleware/permissions");
const validateToDoInput = require("../validation/toDoValidation");

// @route  GET /api/todos/test
// @desc  Test the todos route
// @access Public
router.get("/test", (req, res) => {
  res.send("ToDo's route working");
});

// @route  GET /api/todos/new
// @desc  Create a new todo
// @access Private
router.post("/new", requiresAuth, async (req, res) => {
  try {
    const { isValid, errors } = validateToDoInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    // create the new todo
    const newToDo = new ToDo({
      user: req.user._id,
      content: req.body.content,
      complete: false,
    });

    await newToDo.save();

    return res.json(newToDo);
  } catch (err) {
    console.log(err);

    return res.status(500).send(err.message);
  }
});

// @route  GET /api/todos/current
// @desc  Return the current user's todo list
// @access Private
router.get("/current", requiresAuth, async (req, res) => {
  try {
    const completeToDos = await ToDo.find({
      user: req.user._id,
      complete: true,
    }).sort({ compltedAt: -1 });

    const incompleteToDos = await ToDo.find({
      user: req.user._id,
      complete: false,
    }).sort({ createdAt: -1 });

    return res.json({ incomplete: incompleteToDos, complete: completeToDos });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message);
  }
});

// @route  PUT /api/todos/:toDoId/complete
// @desc  Mark a ToDo as complete
// @access Private
router.put("/:toDoId/complete", requiresAuth, async (req, res) => {
  try {
    const toDo = await ToDo.findOne({
      user: req.user._id,
      _id: req.params.toDoId,
    });

    if (!toDo) {
      return res.status(404).json({ error: "Could not find ToDo." });
    }

    if (toDo.complete) {
      return res.status(400).json({ error: "ToDo is already complete." });
    }

    const updatedToDo = await ToDo.findOneAndUpdate(
      {
        user: req.user._id,
        _id: req.params.toDoId,
      },
      {
        complete: true,
        compltedAt: new Date(),
      },
      {
        new: true,
      }
    );

    return res.json(updatedToDo);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message);
  }
});

// @route  PUT /api/todos/:toDoId/incomplete
// @desc  Mark a ToDo as incomplete
// @access Private
router.put("/:toDoId/incomplete", requiresAuth, async (req, res) => {
  try {
    const toDo = await ToDo.findOne({
      user: req.user._id,
      _id: req.params.toDoId,
    });
    if (!toDo) {
      return res.status(404).json({ error: "Could not find ToDo." });
    }

    if (!toDo.complete) {
      return res.status(400).json({ error: "ToDo is already incomplete." });
    }

    const updatedToDo = await ToDo.findOneAndUpdate(
      {
        user: req.user._id,
        _id: req.params.toDoId,
      },
      {
        complete: false,
        compltedAt: null,
      },
      {
        new: true,
      }
    );
    return res.json(updatedToDo);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message);
  }
});

// @route  PUT /api/todos/:toDoId/incomplete
// @desc  Update a todo
// @access Private
router.put("/:toDoId", requiresAuth, async (req, res) => {
  try {
    const toDo = await ToDo.findOne({
      user: req.user._id,
      _id: req.params.toDoId,
    });

    if (!toDo) {
      return res.status(404).json({ error: "ToDo not found." });
    }

    const { isValid, errors } = validateToDoInput(req.body);

    if (!isValid) {
      return res.status(400).send(errors);
    }

    const updatedToDo = await ToDo.findOneAndUpdate(
      {
        user: req.user._id,
        _id: req.params.toDoId,
      },
      {
        content: req.body.content,
      },
      {
        new: true,
      }
    );

    return res.json(updatedToDo);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message);
  }
});

// @route  DELETE /api/todos/:toDoId
// @desc  Delete a todo
// @access Private
router.delete("/:toDoId", requiresAuth, async(req, res) => {

  try {
      const toDo = await ToDo.findByIdAndDelete({
        user: req.user._id,
        _id: req.params.toDoId,
      });

      if (!toDo) {
        return res.status(404).json({ error: "ToDo not found." })
      }

      await ToDo.findOneAndRemove({
        user: req.user._id,
        _id: req.params.toDoId 
      })

      return res.json({ success: true })

  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message);
  }


})

module.exports = router;

/* eslint-disable indent */
const path = require('path');
const express = require('express');
const xss = require('xss');
const NotesService = require('./notes-service');
const notesRouter= express.Router();
const jsonParser = express.json();

const serializeNote = note =>({
  id:note.id,
  notes_name:xss(note.notes_name),
  modified:note.modified,
  content:note.content,
  folders_id:note.folders_id
});

notesRouter
  .route('/')
  .get((req, res, next) =>{
    const knexInstance = req.app.get('db');
    NotesService.getAllNotes(knexInstance)
      .then(notes =>{
        res.json(notes.map(serializeNote));
      })

      .catch(next);
  })
  .post(jsonParser, (req, res, next) =>{
    const {notes_name, modified, content, folders_id} = req.body;
    const newNote = {notes_name, content, modified, folders_id};

    for(const [key, value] of Object.entries(newNote)){
      if(value == null)
        return res.status(400).json({
          error:{message:`Missing '${key}' in request body`}
        });
    }
      NotesService.insertNote(
        req.app.get('db'),
        newNote
      )
        .then(note =>{
          res 
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${note.id}`))
            .json(serializeNote(note));
        })
        .catch(next);
           
    });

    notesRouter
     .route('/:note_id')
     .all((req, res, next) =>{
        NotesService.getById(
            req.app.get('db'),
            req.params.note_id
        )
        .then(note => {
            if(!note){
                return res.status(404).json({
                    error:{ message: `Note doesn't exist`}
                });
            }
            res.note = note;
            next();
        })
        .catch(next);
     })

     .get((req, res, next) =>{
         res.json(serializeNote(res.note));
     })
     .delete((req, res, next) =>{
         NotesService.deleteNote(
             req.app.get('db'),
             req.params.note_id
         )

         .then(numRpws =>{
             res.status(204).end();
         })
         .catch(next);
     })
     .patch(jsonParser, (req, res, next) =>{
         const { notes_name, modified, content}=req.body;
         const noteToUpdate = {notes_name, modified, content}

         const numberOfValue = Object.values(noteToUpdate).filter(Boolean).length;
         if(numberOfValue === 0)
         return res.status(400).json({
             error:{
                 message:`Request body must contain either 'notes_name', 'modified', 'content'`
             }
         });

         NotesService.updateNote(
             req.app.get('db'),
             req.params.note_id,
             noteToUpdate
         )
         .then(numRow =>{
             res.status(204).end();
         })
         .catch(next);
     });

     module.exports = notesRouter;
  
  
import express from 'express';
import type { Express } from 'express';
import app from './app';

const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const server: Express = app;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

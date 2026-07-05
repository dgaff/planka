/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

exports.up = async (knex) => {
  await knex.schema.alterTable('board', (table) => {
    table.renameColumn('keep_open_after_card_create', 'close_after_card_create');
  });

  // Invert stored values so each board keeps its current behavior under the new,
  // opposite-meaning flag (close = !keepOpen).
  await knex('board').update({
    close_after_card_create: knex.raw('NOT close_after_card_create'),
  });

  return knex.schema.alterTable('board', (table) => {
    table.boolean('close_after_card_create').notNullable().defaultTo(false).alter();
  });
};

exports.down = async (knex) => {
  await knex.schema.alterTable('board', (table) => {
    table.renameColumn('close_after_card_create', 'keep_open_after_card_create');
  });

  await knex('board').update({
    keep_open_after_card_create: knex.raw('NOT keep_open_after_card_create'),
  });

  return knex.schema.alterTable('board', (table) => {
    table.boolean('keep_open_after_card_create').notNullable().defaultTo(true).alter();
  });
};

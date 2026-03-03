const { pb, ensureAdminAuth } = require('../pb');

const ROUTINES = {
  daily_checkin: {
    id: 'daily_checkin',
    label: 'Daily Check-In',
    blocks: ['journal_intention', 'journal_reflection'],
  },
};

const BLOCKS = {
  journal_intention: {
    id: 'journal_intention',
    prompt: 'Set your intention for today in one sentence.',
    input_type: 'text',
    tags: ['intention.daily'],
    semantic_key: 'intention.daily',
  },
  journal_reflection: {
    id: 'journal_reflection',
    prompt: 'Share one quick reflection from today.',
    input_type: 'text',
    tags: ['journal.daily'],
    semantic_key: 'journal.daily',
  },
};

const activeRoutineState = {};

function getRoutineById(routineId) {
  return ROUTINES[routineId] || null;
}

function getBlockById(blockId) {
  return BLOCKS[blockId] || null;
}

async function startRoutine(ctx, routineId) {
  const userId = String(ctx.from.id);
  const routine = getRoutineById(routineId);
  if (!routine) {
    await ctx.reply('That routine is not available yet.');
    return false;
  }

  activeRoutineState[userId] = { routineId, blockIndex: 0 };
  const firstBlock = getBlockById(routine.blocks[0]);
  await ctx.reply(`🧭 ${routine.label}`);
  await ctx.reply(firstBlock.prompt, { reply_markup: { force_reply: true } });
  return true;
}

async function handleRoutineText(ctx) {
  const userId = String(ctx.from.id);
  const state = activeRoutineState[userId];
  if (!state) return false;

  const routine = getRoutineById(state.routineId);
  const blockId = routine.blocks[state.blockIndex];
  const block = getBlockById(blockId);

  await ensureAdminAuth();
  await pb.collection('block_entries').create({
    user_id: userId,
    routine_id: routine.id,
    block_id: block.id,
    tags: block.tags,
    value: { text: ctx.message.text.trim() },
    metadata: { input_type: block.input_type },
    semantic_key: `${userId}:${block.semantic_key}`,
  });

  state.blockIndex += 1;
  if (state.blockIndex >= routine.blocks.length) {
    delete activeRoutineState[userId];
    await ctx.reply('✅ Routine complete. Entry saved to your timeline.');
    return { completed: true, routineId: routine.id };
  }

  const nextBlock = getBlockById(routine.blocks[state.blockIndex]);
  await ctx.reply(nextBlock.prompt, { reply_markup: { force_reply: true } });
  return { completed: false, routineId: routine.id };
}

module.exports = {
  ROUTINES,
  BLOCKS,
  startRoutine,
  handleRoutineText,
};

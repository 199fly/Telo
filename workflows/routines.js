const { pb, ensureAdminAuth } = require('../pb');

const ROUTINES = {
  daily_checkin: {
    id: 'daily_checkin',
    label: 'Daily Check-In',
    blocks: ['journal_intention', 'journal_reflection'],
  },
  focus_mode: {
    id: 'focus_mode',
    label: 'Focus Mode',
    blocks: ['focus_task', 'focus_duration', 'focus_commitment'],
  },
  break_mode: {
    id: 'break_mode',
    label: 'Break Reset',
    blocks: ['break_activity', 'break_reflection'],
  },
  habit_checkin: {
    id: 'habit_checkin',
    label: 'Habit Check-In',
    blocks: ['habit_name', 'habit_status', 'habit_note'],
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
  focus_task: {
    id: 'focus_task',
    prompt: 'What is the one task you will focus on right now?',
    input_type: 'text',
    tags: ['focus.task'],
    semantic_key: 'focus.task',
  },
  focus_duration: {
    id: 'focus_duration',
    prompt: 'Choose your focus duration.',
    input_type: 'select',
    options: ['25', '45', '60'],
    tags: ['focus.duration'],
    semantic_key: 'focus.duration',
  },
  focus_commitment: {
    id: 'focus_commitment',
    prompt: 'Before you begin, write one commitment sentence to avoid distractions.',
    input_type: 'text',
    tags: ['focus.commitment'],
    semantic_key: 'focus.commitment',
  },
  break_activity: {
    id: 'break_activity',
    prompt: 'Pick a mindful break activity.',
    input_type: 'select',
    options: ['Hydrate', 'Stretch', 'Breathing', 'Walk'],
    tags: ['break.activity'],
    semantic_key: 'break.activity',
  },
  break_reflection: {
    id: 'break_reflection',
    prompt: 'How do you feel after this break? (one line)',
    input_type: 'text',
    tags: ['break.reflection'],
    semantic_key: 'break.reflection',
  },
  habit_name: {
    id: 'habit_name',
    prompt: 'Which habit are you checking in?',
    input_type: 'select',
    options: ['Default Habit'],
    tags: ['habit.name'],
    semantic_key: 'habit.name',
  },
  habit_status: {
    id: 'habit_status',
    prompt: 'How did it go?',
    input_type: 'select',
    options: ['Done', 'In Progress', 'Skipped'],
    tags: ['habit.status'],
    semantic_key: 'habit.status',
  },
  habit_note: {
    id: 'habit_note',
    prompt: 'Optional: add a short note about this habit check-in.',
    input_type: 'text',
    tags: ['habit.note'],
    semantic_key: 'habit.note',
    optional: true,
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

  const profile = await findProfile(userId);
  const resolvedBlocks = buildResolvedBlocks(routine, profile);
  activeRoutineState[userId] = { routineId, blockIndex: 0, blocks: resolvedBlocks };

  await ctx.reply(`🧭 ${routine.label}`);
  await askCurrentBlock(ctx, activeRoutineState[userId]);
  return true;
}

async function handleRoutineText(ctx) {
  const userId = String(ctx.from.id);
  const state = activeRoutineState[userId];
  if (!state) return false;

  const routine = getRoutineById(state.routineId);
  const block = state.blocks[state.blockIndex];
  const trimmedText = ctx.message.text.trim();

  if (block.input_type === 'select' && Array.isArray(block.options) && block.options.length > 0) {
    const validOption = block.options.find((option) => option.toLowerCase() === trimmedText.toLowerCase());
    if (!validOption) {
      await ctx.reply(`Please choose one of: ${block.options.join(', ')}`);
      await askCurrentBlock(ctx, state);
      return { completed: false, routineId: routine.id };
    }
  }

  const wantsSkip = block.optional && trimmedText.toLowerCase() === 'skip';
  if (!wantsSkip && (!block.optional || trimmedText.length > 0)) {
    await saveBlockEntry(userId, routine.id, block, trimmedText);
  }

  state.blockIndex += 1;
  if (state.blockIndex >= state.blocks.length) {
    delete activeRoutineState[userId];
    await ctx.reply('✅ Routine complete. Entry saved to your timeline.');
    return { completed: true, routineId: routine.id };
  }

  await askCurrentBlock(ctx, state);
  return { completed: false, routineId: routine.id };
}

async function askCurrentBlock(ctx, state) {
  const block = state.blocks[state.blockIndex];
  if (block.input_type === 'select' && Array.isArray(block.options)) {
    await ctx.reply(`${block.prompt}\n${block.options.map((option) => `• ${option}`).join('\n')}`, {
      reply_markup: { force_reply: true },
    });
    return;
  }

  const prompt = block.optional ? `${block.prompt}\n(Reply "skip" to leave empty.)` : block.prompt;
  await ctx.reply(prompt, { reply_markup: { force_reply: true } });
}

function buildResolvedBlocks(routine, profile) {
  return routine.blocks.map((blockId) => {
    const block = { ...getBlockById(blockId) };

    if (block.id === 'focus_duration' && profile?.focus_minutes) {
      const preferred = String(profile.focus_minutes);
      if (!block.options.includes(preferred)) {
        block.options = [preferred, ...block.options];
      }
      block.prompt = `Choose your focus duration (default ${preferred} min).`;
    }

    if (block.id === 'habit_name' && Array.isArray(profile?.habits) && profile.habits.length > 0) {
      block.options = profile.habits.map((habit) => String(habit).trim()).filter(Boolean);
    }

    return block;
  });
}

async function saveBlockEntry(userId, routineId, block, value) {
  await ensureAdminAuth();
  await pb.collection('block_entries').create({
    user_id: userId,
    routine_id: routineId,
    block_id: block.id,
    tags: block.tags,
    value: { text: value },
    metadata: { input_type: block.input_type, options: block.options || null },
    semantic_key: `${userId}:${block.semantic_key}`,
  });
}

async function findProfile(userId) {
  try {
    return await pb.collection('profiles').getFirstListItem(`user_id="${userId}"`);
  } catch (err) {
    return null;
  }
}

module.exports = {
  ROUTINES,
  BLOCKS,
  startRoutine,
  handleRoutineText,
};

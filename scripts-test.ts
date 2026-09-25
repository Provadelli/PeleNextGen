import { createClient } from '@supabase/supabase-js';

// Uso: TEST_USERS="email:senha,email:senha" bun scripts-test.ts
const users = (process.env.TEST_USERS ?? '')
  .split(',')
  .map((pair) => pair.trim())
  .filter(Boolean)
  .map((pair) => {
    const i = pair.indexOf(':');
    return [pair.slice(0, i), pair.slice(i + 1)] as const;
  });
if (users.length === 0) {
  console.error('Defina TEST_USERS="email:senha,email:senha" no ambiente.');
  process.exit(1);
}

const s = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!);
for (const [email, pw] of users) {
  const { data, error } = await s.auth.signInWithPassword({ email, password: pw });
  console.log(email, 'err:', error?.message, 'uid:', data?.user?.id);
  if (data?.user) {
    const { data: roles, error: re } = await s.from('user_roles').select('role').eq('user_id', data.user.id);
    console.log(' roles:', JSON.stringify(roles), 'err:', re?.message);
    await s.auth.signOut();
  }
}

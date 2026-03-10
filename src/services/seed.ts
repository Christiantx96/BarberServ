import { supabase } from '../lib/supabase';

// Helper temporary function to inject basic data so the user can see the App working
export async function seedInitialData() {
  console.log('Iniciando o Seed de dados iniciais...');
  // 1. Criar Barbeiro Master se não existir
  let { data: barber } = await supabase.from('barbers').select('*').eq('email', 'c.abiatti@gmail.com').single();
  
  if (!barber) {
    const { data: newBarber, error: errBarber } = await supabase.from('barbers').insert([
      { name: 'Barbeiro Master', email: 'c.abiatti@gmail.com', phone: '11999999999', status: 'active' }
    ]).select().single();
    if (errBarber) console.error('Erro ao criar Barbeiro:', errBarber);
    barber = newBarber;
  }

  // 2. Criar Serviços Básico
  let { data: service } = await supabase.from('services').select('*').limit(1).single();
  if (!service) {
     const { error: errServ } = await supabase.from('services').insert([
      { name: 'Corte Degradê', duration: 40, price: 45.00, active: true },
       { name: 'Barba Terapia', duration: 30, price: 35.00, active: true },
       { name: 'Corte + Barba', duration: 70, price: 70.00, active: true }
    ]);
     if (errServ) console.error('Erro ao criar Serviços:', errServ);
  }

  // 3. Criar Agenda para o Barbeiro (Segunda a Sabado)
  if (barber) {
    let { data: schedule } = await supabase.from('schedules').select('*').eq('barber_id', barber.id).limit(1).single();
    if (!schedule) {
      const schedules = [1, 2, 3, 4, 5, 6].map(day => ({
        barber_id: barber.id,
        day_of_week: day,
        start_time: '09:00:00',
        end_time: '19:00:00',
        is_active: true
      }));
      const { error: errSch } = await supabase.from('schedules').insert(schedules);
      if (errSch) console.error('Erro ao gerar Horários:', errSch);
    }
  }
  console.log('Seed Finalizado!');
}

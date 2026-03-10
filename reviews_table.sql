-- Tabela de Avaliações
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Políticas RLS para Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para todos" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserção para usuários autenticados" ON reviews
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Seed de exemplo para avaliação (opcional)
-- INSERT INTO reviews (appointment_id, rating, comment) 
-- SELECT id, 5, 'Excelente atendimento!' FROM appointments LIMIT 1;

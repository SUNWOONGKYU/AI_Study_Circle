// ========== Supabase Configuration ==========
// TODO: 아래 값을 실제 Supabase 프로젝트 설정값으로 교체하세요
const SUPABASE_URL = 'https://vmiyqfkcoqdnkxjnxijt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtaXlxZmtjb3Fkbmt4am54aWp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjgwNjYsImV4cCI6MjA4NTYwNDA2Nn0.f7CCtWxojyvvbmlG-zwujDIylqjqhBpE11uI1J8Vrj4';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========== Auth Helpers ==========
const Auth = {
    async signUp(email, password, metadata) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: metadata }
        });
        if (error) throw error;
        return data;
    },

    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    async getSession() {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },

    async getUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback);
    }
};

// ========== DB Helpers ==========
const DB = {
    // -- Profiles --
    async getProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) throw error;
        return data;
    },

    async updateProfile(userId, updates) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // -- Events --
    async getEvents() {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('is_active', true)
            .order('event_date', { ascending: true });
        if (error) throw error;
        return data;
    },

    async getEvent(eventId) {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();
        if (error) throw error;
        return data;
    },

    // -- Attendance --
    async attendEvent(userId, eventId, note) {
        const { data, error } = await supabase
            .from('attendance')
            .insert({ user_id: userId, event_id: eventId, note: note || '' })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async cancelAttendance(userId, eventId) {
        const { error } = await supabase
            .from('attendance')
            .delete()
            .eq('user_id', userId)
            .eq('event_id', eventId);
        if (error) throw error;
    },

    async getMyAttendance(userId) {
        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('user_id', userId);
        if (error) throw error;
        return data;
    },

    // -- Admin: Members --
    async getAllProfiles() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    // -- Admin: Events CRUD --
    async createEvent(event) {
        const { data, error } = await supabase
            .from('events')
            .insert(event)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async updateEvent(eventId, updates) {
        const { data, error } = await supabase
            .from('events')
            .update(updates)
            .eq('id', eventId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async getAllEvents() {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('event_date', { ascending: false });
        if (error) throw error;
        return data;
    },

    // -- Admin: Attendance by event --
    async getEventAttendees(eventId) {
        const { data, error } = await supabase
            .from('attendance')
            .select('*, profiles(name, phone)')
            .eq('event_id', eventId)
            .order('created_at', { ascending: true });
        if (error) throw error;
        return data;
    }
};

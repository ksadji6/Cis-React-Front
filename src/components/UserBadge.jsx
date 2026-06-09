import { useEffect, useState } from 'react';
import { userService } from '../services/userService';

export const UserBadge = ({ userId, label }) => {
    const [name, setName] = useState("Chargement...");

    useEffect(() => {
        if (!userId) {
            setName("Non assigné");
            return;
        }

        userService.getUserById(userId)
            .then(user => setName(`${user.prenom || ''} ${user.nom || ''}`))
            .catch(err => {
                console.warn("Erreur chargement utilisateur, affichage ID par défaut", err);
                setName(`Utilisateur ${userId}`); // <--- ON AFFICHE L'ID SI L'API EST BLOQUÉE
            });
    }, [userId]);

    return (
        <div style={{ marginBottom: '8px', fontSize: '13px' }}>
            <span style={{ color: '#888' }}>{label} : </span>
            <span style={{ fontWeight: 600 }}>{name}</span>
        </div>
    );
};
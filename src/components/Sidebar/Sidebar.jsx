import React, { useState } from 'react';
import './Sidebar.css';
import { assets } from '../../assets/assets';

const Sidebar = ({ onNewChat, onSelectChat, chatHistory = [], onDeleteChat, onDownloadChat }) => {
    const [extended, setExtended] = useState(false);
    const [menuOpenId, setMenuOpenId] = useState(null);

    const toggleMenu = (e, id) => {
        e.stopPropagation(); // sohbet tıklamasını engelle
        setMenuOpenId(prev => (prev === id ? null : id));
    };

    const closeMenu = () => {
        setMenuOpenId(null);
    };

    return (
        <div className='sidebar' onClick={closeMenu}>
            <div className="top">
                <img
                    onClick={(e) => {
                        e.stopPropagation();
                        setExtended(prev => !prev);
                    }}
                    className='menu'
                    src={assets.menu_icon}
                    alt=""
                />

                <div className="new-chat" onClick={(e) => { e.stopPropagation(); onNewChat(); }}>
                    <img src={assets.plus_icon} alt="" />
                    {extended ? <p>New Chat</p> : null}
                </div>

                {extended && (
                    <div className="recent">
                        <p className="recent-title">Recent</p>

                        {(chatHistory?.length ?? 0) === 0 && (
                            <div className="recent-entry" style={{ opacity: .6 }}>
                                <img src={assets.message_icon} alt="" />
                                <p>No chats yet</p>
                            </div>
                        )}

                        {chatHistory?.map(item => (
                            <div
                                key={item.id}
                                className="recent-entry"
                                onClick={() => onSelectChat(item)}
                            >
                                <div className="recent-title-text" title={item.title}>
                                    <img src={assets.message_icon} alt="" />
                                    <p>{item.title}</p>
                                </div>

                                {/* Üç nokta butonu */}
                                <button
                                    className="kebab-btn"
                                    onClick={(e) => toggleMenu(e, item.id)}
                                >
                                    ⋯
                                </button>

                                {/* Menü */}
                                {menuOpenId === item.id && (
                                    <div className="recent-menu" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => onDownloadChat(item)}>İndir (PDF)</button>
                                        <button className="danger" onClick={() => onDeleteChat(item.id)}>Sil</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bottom">
                <div className="bottom-item recent-entry">
                    <img src={assets.question_icon} alt="" />
                    {extended ? <p>Help</p> : null}
                    <span className="tooltip">Şu an aktif değil</span>
                </div>
                <div className="bottom-item recent-entry">
                    <img src={assets.history_icon} alt="" />
                    {extended ? <p>Activity</p> : null}
                    <span className="tooltip">Şu an aktif değil</span>
                </div>
                <div className="bottom-item recent-entry">
                    <img src={assets.setting_icon} alt="" />
                    {extended ? <p>Settings</p> : null}
                    <span className="tooltip">Şu an aktif değil</span>
                </div>
            </div>

        </div>
    );
};

export default Sidebar;
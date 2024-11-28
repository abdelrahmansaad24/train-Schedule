import React from 'react';
import styles from './Header.module.css';

const Header = props => {
    return (
        <div className={styles.Header}>
            <div
                className={styles.title}
                role="banner"  // ARIA role indicating this is a banner (typically the header of the page)
                aria-label="Train schedule"  // ARIA label to describe the purpose of the header
            >
                Train Schedule
            </div>
        </div>
    );
};

export default Header;

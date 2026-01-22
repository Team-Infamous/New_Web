import React from 'react'
import Link from 'next/link'
import styles from '../../styles/Epimglist.module.css'

function EpNumList({ data, epdata, defaultProvider, subtype, epnum, progress }) {

    return (
        <div className={styles.epnumlistcontainer}>
            {epdata
                .slice()
                .map((episode) => {
                    const isWatched = parseInt(progress) >= episode.number;
                    return(
                    <Link
                        href={`/anime/watch?id=${data?.id}&host=${defaultProvider}&epid=${encodeURIComponent(
                            episode?.id || episode?.episodeId
                        )}&ep=${episode?.number}&type=${subtype}`}
                        key={episode?.id || episode?.episodeId}
                    >
                        <div className={`${episode.isFiller === true ? 'bg-[#f9a825]/20' : 'bg-[#67686f]/40'} ${styles.epdiv} ${parseInt(epnum) === episode.number ? styles.selectedEpnum : ''} ${isWatched ? 'opacity-50' : ''}`}>
                            {episode.number}</div>
                    </Link>
                )})}
        </div>
    )
}

export default EpNumList

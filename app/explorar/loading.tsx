import styles from './loading.module.css'

export default function LoadingExplorePage() {
  return (
    <div className={styles.screen}>
      <div className={styles.loader}>
        <div className={styles.wedge}></div>
      </div>
    </div>
  )
}

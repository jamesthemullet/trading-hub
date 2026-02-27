/* istanbul ignore file */

import { Button, Typography } from '@/libs/components';
import { color } from '@/libs/utils/constants';

import styles from './index.module.css';

const StyleGuide = () => {
  return (
    <div className={styles.container}>
      <Typography as="h1" variant="headlineLarge" isStrong>
        Style guide
      </Typography>
      <Typography as="h2" variant="headlineMedium" isStrong>
        Headings
      </Typography>
      <div className={styles.guide}>
        <Typography as="h1" variant="headlineLarge" isStrong>
          Header1
        </Typography>
        <Typography variant="bodySmall">New MS London</Typography>
        <Typography variant="bodySmall">Size: 35px</Typography>
        <Typography variant="bodySmall">Type: Bold</Typography>
        <Typography>
          <code>&lt;Header1 /&gt;</code>
        </Typography>
      </div>
      <div className={styles.guide}>
        <Typography as="h2" variant="headlineMedium" isStrong>
          Header2
        </Typography>
        <Typography>New MS London</Typography>
        <Typography variant="bodySmall">Size: 25px</Typography>
        <Typography variant="bodySmall">Type: Bold</Typography>
        <Typography>
          <code>&lt;Header2 /&gt;</code>
        </Typography>
      </div>
      <div className={styles.guide}>
        <Typography as="h3" variant="headlineSmall" isStrong>
          Header3
        </Typography>
        <Typography variant="bodySmall">New MS London</Typography>
        <Typography variant="bodySmall">Size: 20px</Typography>
        <Typography variant="bodySmall">Type: Bold</Typography>
        <Typography>
          <code>&lt;Header3 /&gt;</code>
        </Typography>
      </div>
      <div className={styles.guide}>
        <Typography variant="titleSmall">Title</Typography>
        <Typography variant="bodySmall">New MS London</Typography>
        <Typography variant="bodySmall">Size: 14px</Typography>
        <Typography variant="bodySmall">Type: Bold</Typography>
        <Typography>
          <code>&lt;Title /&gt;</code>
        </Typography>
      </div>
      <div className={styles.guide}>
        <Typography variant="bodySmall">Text</Typography>
        <Typography variant="bodySmall">New MS London</Typography>
        <Typography variant="bodySmall">Size: 14px</Typography>
        <Typography variant="bodySmall">Type: Regular</Typography>
        <Typography>
          <code>&lt;Text /&gt;</code>
        </Typography>
      </div>
      <div className={styles.guide}>
        <Typography variant="bodySmall" isStrong>
          Text
        </Typography>
        <Typography variant="bodySmall">New MS London</Typography>
        <Typography variant="bodySmall">Size: 14px</Typography>
        <Typography variant="bodySmall">Type: Regular</Typography>
        <Typography>
          <code>&lt;Text isStrong /&gt;</code>
        </Typography>
      </div>
      <div className={styles.guide}>
        <Typography variant="labelLarge">Label</Typography>
        <Typography variant="bodySmall">New MS London</Typography>
        <Typography variant="bodySmall">Size: 16px</Typography>
        <Typography variant="bodySmall">Type: Regular</Typography>
        <Typography>
          <code>&lt;Label /&gt;</code>
        </Typography>
      </div>
      <div className={styles.guide}>
        <Typography variant="labelLarge" isStrong>
          Label
        </Typography>
        <Typography variant="bodySmall">New MS London</Typography>
        <Typography variant="bodySmall">Size: 16px</Typography>
        <Typography variant="bodySmall">Type: Bold</Typography>
        <Typography>
          <code>&lt;Label isStrong /&gt;</code>
        </Typography>
      </div>

      <Typography as="h2" variant="headlineMedium" isStrong>
        Buttons
      </Typography>
      <div className={styles.guide}>
        <div className={styles.buttonExample}>
          <Button theme="primary">Button</Button>
        </div>
        <Typography variant="bodySmall">Primary</Typography>
        <Typography variant="bodySmall">
          <code>
            &lt;Button theme=&quot;primary&quot; &gt;Button&lt;/Button&gt;
          </code>
        </Typography>
      </div>
      <div className={styles.guide}>
        <div className={styles.buttonExample}>
          <Button>Button</Button>
        </div>
        <Typography variant="bodySmall">Secondary</Typography>
        <Typography variant="bodySmall">
          <code>&lt;Button&gt;Button&lt;/Button&gt;</code>
        </Typography>
      </div>
      <div className={styles.guide}>
        <div className={styles.buttonExample}>
          <Button isDisabled>Button</Button>
        </div>
        <Typography variant="bodySmall">Inactive</Typography>
        <Typography variant="bodySmall">
          <code>&lt;Button isDisabled&gt;Button&lt;/Button&gt;</code>
        </Typography>
      </div>
      <div className={styles.guide}>
        <div className={styles.buttonExample}>
          <Button theme="tertiary">Button</Button>
        </div>
        <Typography variant="bodySmall">Tertiary</Typography>
        <Typography variant="bodySmall">
          <code>
            &lt;Button theme=&quot;tertiary&quot; &gt;Button&lt;/Button&gt;
          </code>
        </Typography>
      </div>
      <div className={styles.guide}>
        <div className={styles.buttonExample}>
          <Button theme="tertiary" isDisabled>
            Button
          </Button>
        </div>
        <Typography variant="bodySmall">Tertiary Inactive</Typography>
        <Typography variant="bodySmall">
          <code>
            &lt;Button theme=&quot;tertiary&quot;
            isDisabled&gt;Button&lt;/Button&gt;
          </code>
        </Typography>
      </div>
      <div className={styles.guide}>
        <div className={styles.buttonExample}>
          <Button theme="filled" isInline>
            Button
          </Button>
        </div>
        <Typography variant="bodySmall">Filled</Typography>
        <Typography variant="bodySmall">
          <code>
            &lt;Button theme=&quot;filled&quot;
            isInline&gt;Button&lt;/Button&gt;
          </code>
        </Typography>
      </div>
      <div className={styles.guide}>
        <div className={styles.buttonExample}>
          <Button theme="outlined" isInline>
            Button
          </Button>
        </div>
        <Typography variant="bodySmall">Outlined</Typography>
        <Typography variant="bodySmall">
          <code>
            &lt;Button theme=&quot;outlined&quot;
            isInline&gt;Button&lt;/Button&gt;
          </code>
        </Typography>
      </div>

      <Typography as="h2" variant="headlineMedium">
        Colours
      </Typography>

      <div className={styles.guide}>
        <div className={`${styles.colour} ${styles.infoBlueBackground}`} />
        <Typography variant="bodySmall">color.infoBlueBackground</Typography>
        <Typography variant="bodySmall">
          <code>{color.infoBlueBackground}</code>
        </Typography>
      </div>
      <div className={styles.guide}>
        <div className={`${styles.colour} ${styles.lightGreen}`} />
        <Typography variant="bodySmall">color.lightGreen</Typography>
        <Typography variant="bodySmall">
          <code>{color.lightGreen}</code>
        </Typography>
      </div>
      <div className={styles.guide}>
        <div className={`${styles.colour} ${styles.lightGrey}`} />
        <Typography variant="bodySmall">color.lightGrey</Typography>
        <Typography variant="bodySmall">
          <code>{color.lightGrey}</code>
        </Typography>
      </div>
      <div className={styles.guide}>
        <div className={`${styles.colour} ${styles.selectionBox}`} />
        <Typography variant="bodySmall">color.selectionBox</Typography>
        <Typography variant="bodySmall">
          <code>{color.selectionBox}</code>
        </Typography>
      </div>
      <div className={styles.guide}>
        <div className={`${styles.colour} ${styles.successGreenBackground}`} />
        <Typography variant="bodySmall">
          color.successGreenBackground
        </Typography>
        <Typography variant="bodySmall">
          <code>{color.successGreenBackground}</code>
        </Typography>
      </div>
    </div>
  );
};

export default StyleGuide;

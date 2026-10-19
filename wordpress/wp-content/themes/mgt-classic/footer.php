<?php $t = mgt_copy(); $site = mgt_contacts(); ?>
</div><footer class="footer"><div class="shell"><div class="footer-main"><a href="<?php echo esc_url(mgt_url()); ?>" aria-label="<?php echo esc_attr($t['brandLabel']); ?>"><?php mgt_logo(); ?></a><nav aria-label="<?php echo esc_attr($t['footerNavLabel']); ?>">
<?php foreach (['/products/','/#about','/#contact'] as $i=>$path): ?><a href="<?php echo esc_url(mgt_url($path)); ?>"><?php echo esc_html($t['nav'][$i+1]); ?></a><?php endforeach; ?>
</nav></div><div class="footer-bottom"><a class="footer-email" href="<?php echo esc_url('mailto:' . $site['companyEmail']); ?>" dir="ltr"><?php echo esc_html($site['companyEmail']); ?></a><a href="#home"><?php echo esc_html($t['backTop']); ?> <span aria-hidden="true">↑</span></a></div></div></footer></div>
<?php wp_footer(); ?></body></html>

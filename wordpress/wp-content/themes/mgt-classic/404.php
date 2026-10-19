<?php get_header(); ?>
<main id="main" class="catalog-main"><div class="shell catalog-content"><div class="catalog-empty"><span class="section-kicker">404</span><h1><?php echo esc_html(mgt_text('صفحه پیدا نشد','Page not found')); ?></h1><p><?php echo esc_html(mgt_text('این آدرس موجود نیست یا محصول هنوز منتشر نشده است.','This page does not exist or the product has not been published.')); ?></p><a class="gold-button" href="<?php echo esc_url(mgt_url('/products/')); ?>"><?php echo esc_html(mgt_text('مشاهده محصولات','Browse products')); ?></a></div></div></main>
<?php get_footer(); ?>

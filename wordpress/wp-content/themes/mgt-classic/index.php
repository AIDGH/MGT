<?php get_header(); ?>
<main id="main" class="catalog-main"><div class="shell catalog-content"><?php while(have_posts()): the_post(); ?><article><h1><?php the_title(); ?></h1><?php the_content(); ?></article><?php endwhile; ?></div></main>
<?php get_footer(); ?>
